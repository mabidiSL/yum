'use strict';
const express = require('express');
const exRoute = express.Router();

const app = express();
const cors = require('cors');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const transport = require('../config/nodemailer');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Recipe = require('../models/recipesLikes');
const auth = require('../middleware/auth'); // Import the auth middleware
const { Console } = require('console');

const upload = require('../config/multerConfig');
const b2 = require('../config/b2Config');
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');


const bucketName = 'yummy-user-p';

const MONGO_URI = 'mongodb+srv://bouda996:SGVSNwxBaVVubMdC@yummyuser.h2ltahd.mongodb.net/?retryWrites=true&w=majority&appName=yummyuser';
const SECRET_KEY = '9f45e9d85c0c552ce01aeebd9db0da30918f941ea2381e758fc1f49254a033e0';

const EMAIL_SECRET = '9f45e9d85c0c552ce01aeebd9db0da30918f941ea2381e758fc1f49254a033e1';


// Connect to MongoDB
mongoose.connect(MONGO_URI);

// Middleware
app.use(cors());
app.use(express.json());

exRoute.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Log the received body
        console.log('Request Body:', req.body);

        // Check if any of the required fields are missing
        if (!username || !email || !password) {
            return res.status(400).send('Missing required fields');
        }

        // Check if the user already exists
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).send('User already exists');
        }

        // Hash the password and create a new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });


        await newUser.save();
        // Generate reset token and expiry
        // newUser.generatePin();


        // Generate a verification token
        const token = jwt.sign({ userId: newUser._id }, EMAIL_SECRET, { expiresIn: '1h' });
        newUser.verificationToken = token;


        await sendVerificationEmail(newUser);


        res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
    }
});

// Function to send verification email
async function sendVerificationEmail(user) {

    // Read the HTML file
    let htmlContent = await fsp.readFile(path.join(__dirname, 'emailTemplate.html'), 'utf8');

    // Replace placeholder with actual verification link
    htmlContent = htmlContent.replace('{{verificationToken}}', user.verificationToken);

    const mailOptions = {
        to: user.email,
        from: "bouda996@gmail.com",
        subject: 'Email Verification',
        html: htmlContent,

    };
    transport.sendMail(mailOptions, (err, info) => {
        if (err) {
            return res.status(500).json({ message: 'Error sending verification email', error: err.message });
        }
    });
}
exRoute.get('/verify-email', async (req, res) => {
    const { token } = req.query;

    try {
        console.log(token);
        const decoded = jwt.verify(token, EMAIL_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        res.status(200).json({ message: 'Email successfully verified' });
    } catch (err) {
        console.error('Token verification failed:', err.message);
        res.status(400).json({ message: 'Invalid or expired token' });
    }
});



exRoute.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log(email);
        console.log(password);
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send('User not found');
        if (!user.emailVerifiedAt) {
            const token2 = jwt.sign({ userId: user._id }, EMAIL_SECRET, { expiresIn: '1h' });
            console.log(token2);
            user.verificationToken = token2;
            await sendVerificationEmail(user);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).send('Invalid credentials');

        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, username: user.username, userId: user._id });
    } catch (error) {
        res.status(500).send('Error logging in user: ' + error);
    }
});

exRoute.put('/user', auth, async (req, res) => {
    try {
        const { userId } = req.user;
        console.log(req.body);
        await User.findByIdAndUpdate(
            userId,
            req.body,
            { new: true });

        const user = await User.findById(userId).select('-password');
        if (!user) return res.status(404).send('User not found');
        res.send(user);
    } catch (error) {
        res.status(500).send('Error updating user ' + error);
    }
});

// Update user password
exRoute.put('/:id/password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;



    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if the current password is correct
        //   const isMatch = await user.compare(currentPassword);
        const isMatch = bcrypt.compare(currentPassword, user.password);

        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

        // Hash the new password
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//upload user profile image
exRoute.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const fileContent = fs.readFileSync(req.file.path);
        const params = {
            Bucket: bucketName,
            Key: req.file.filename,
            Body: fileContent,
            ContentType: req.file.mimetype,
        };

        const data = await b2.upload(params).promise();

        fs.unlinkSync(req.file.path); // Remove file from server after upload

        res.status(200).json({ fileUrl: data.Location });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//delete user profile image

exRoute.delete('/delete/:filename', async (req, res) => {
    try {
        const params = {
            Bucket: bucketName,
            Key: req.params.filename,
        };

        await b2.deleteObject(params).promise();

        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

exRoute.delete('/user', auth, async (req, res) => {
    try {
        const { userId } = req.user;

        await User.findByIdAndDelete(userId);
        res.send('User deleted');
    } catch (error) {
        res.status(500).send('Error deleting user');
    }
});


exRoute.get('/user', auth, async (req, res) => {
    try {
        const { userId } = req.user;
        const user = await User.findById(userId).select('-password');
        if (!user) return res.status(404).send('User not found');
        res.json(user);
    } catch (error) {
        res.status(500).send('Error fetching user');
    }
});

exRoute.get('/users', auth, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).send('Error fetching users');
    }
});

// Route to request password reset
exRoute.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        // const user = await User.findOne({ email: req.body.email });
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send('No user with that email');
        }

        // Generate reset token and expiry
        user.generatePin();
        await user.save();
        // Send the email
        const mailOptions = {
            to: user.email,
            from: "bouda996@gmail.com",
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested to reset the password for your account.\n\n
      Your password reset PIN is: ${user.Pin}\n\n
      This PIN is valid for one hour.\n`,
        };
        transport.sendMail(mailOptions, (err) => {
            if (err) {
                return res.status(500).send('Error sending email   ' + err);
            }
            res.status(200).send('Password reset email sent');
        });
    } catch (error) {
        res.status(500).send('Error on the server   ' + error);
    }
});

// Route to reset password
exRoute.post('/reset-password', async (req, res) => {

    try {
        const { pin, newPassword } = req.body;

        const user = await User.findOne({
            pin: pin,
            pinExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).send('Password reset token is invalid or has expired');
        }

        // Update the user's password
        user.password = bcrypt.hashSync(newPassword, 10);
        user.pin = undefined;
        user.pinExpires = undefined;

        await user.save();

        res.status(200).send('Password has been reset');
    } catch (error) {
        res.status(500).send('Error on the server  ' + error);
    }
});

exRoute.post('/recepies-likes', async (req, res) => {

    console.log('Request Body:', req.body);

    try {

        const { recipeId, operation } = req.body;

        if (!recipeId) {
            return res.status(400).send({ error: 'Recipe ID is required' });
        }

        const recipe = await Recipe.findOne({ recipeId });

        if (recipe) {
            operation == "add" ? recipe.likesNumber = Number(recipe.likesNumber) + 1 : recipe.likesNumber = Number(recipe.likesNumber) - 1;
            await recipe.save();
        } else {
            const newRecipe = new Recipe({ recipeId: recipeId, likesNumber: 1 });
            await newRecipe.save();
        }

        res.status(200).send('recipe liked');
    } catch (error) {
        console.error('Error saving recipe:', error);
        res.status(500).send('Error recipe');
    }
});

exRoute.get('/recepies-likes', async (req, res) => {

    console.log('Request Body:', req.body);
    console.log('Request param:', req.params);
    console.log('Request query:', req.query);

    try {
        const { recipeId } = req.query;

        // Check if any of the required fields are missing
        if (!recipeId) {
            return res.status(400).json({ error: 'Recipe ID is required' });
        }

        const recipe = await Recipe.findOne({ recipeId });
        if (!recipe) return res.status(404).send('Recipe not found');
        res.json(recipe);
    } catch (error) {
        console.error('Error finding recipe:', error);
        res.status(500).send('Error finding recipe');
    }
});

exRoute.use('/test', function (req, res, next) {
    console.log("crud working");
    res.sendStatus(404);
})

module.exports = exRoute;
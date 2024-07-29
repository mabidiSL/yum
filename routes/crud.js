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
const path = require('path');


const bucketName = 'yummy-user-p';

const MONGO_URI = 'mongodb+srv://bouda996:SGVSNwxBaVVubMdC@yummyuser.h2ltahd.mongodb.net/?retryWrites=true&w=majority&appName=yummyuser';
const SECRET_KEY = '9f45e9d85c0c552ce01aeebd9db0da30918f941ea2381e758fc1f49254a033e0';

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

        res.status(201).send('User registered');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
    }
});


exRoute.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log(email);
        console.log(password);
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send('User not found');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send('Invalid credentials');

        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, username: user.username, userId: user._id });
    } catch (error) {
        res.status(500).send('Error logging in user');
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
        res.send('User updated');
    } catch (error) {
        res.status(500).send('Error updating user ' + error);
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
        user.generatePasswordReset();
        await user.save();
        // Send the email
        const mailOptions = {
            to: user.email,
            from: "bouda996@gmail.com",
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested to reset the password for your account.\n\n
      Your password reset PIN is: ${user.resetPasswordPin}\n\n
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
            resetPasswordPin: pin,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).send('Password reset token is invalid or has expired');
        }

        // Update the user's password
        user.password = bcrypt.hashSync(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

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
            operation=="add"?recipe.likesNumber = Number(recipe.likesNumber) + 1:recipe.likesNumber = Number(recipe.likesNumber) - 1;
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
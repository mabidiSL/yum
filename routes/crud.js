'use strict';
const express = require('express');
const exRoute = express.Router();

const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

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
const axios = require('axios');



const bucketName = 'yummy-user-p';

const MONGO_URI = 'mongodb+srv://bouda996:SGVSNwxBaVVubMdC@yummyuser.h2ltahd.mongodb.net/?retryWrites=true&w=majority&appName=yummyuser';
const SECRET_KEY = '9f45e9d85c0c552ce01aeebd9db0da30918f941ea2381e758fc1f49254a033e0';

const EMAIL_SECRET = '9f45e9d85c0c552ce01aeebd9db0da30918f941ea2381e758fc1f49254a033e1';


// Connect to MongoDB
mongoose.connect(MONGO_URI);

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.use(express.json());

exRoute.post('/register', async (req, res) => {
    try {
        const { username, email, password, cin, city,gender,phone, f_name, l_name, role} = req.body;

        // Log the received body
        console.log('Request Body:', req.body);
        console.log('Request Body ROLE:', role);

        // Check if any of the required fields are missing
        if (!username || !email || !password || !cin || !city || !gender || !phone ||!role) {
            return res.status(400).send('Missing required fields');
        }

        // Check if the user already exists
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).send('User already exists');
        }

        // Hash the password and create a new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email,cin,city,gender,phone,f_name,l_name, password: hashedPassword, role });


        await newUser.save();
        // Generate reset token and expiry
        // newUser.generatePin();


        // Generate a verification token
        const token = jwt.sign({ userId: newUser._id }, EMAIL_SECRET, { expiresIn: '1h' });
        newUser.verificationToken = token;

        //commented to adapt to infinity
        // await sendVerificationEmail(newUser);


        res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
    }
});

exRoute.post('/merchant-register', async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            cin,
            city,
            phone,
            storeName,
            storeLogo,
            country,
            area,
            serviceType,
            supervisorName,
            supervisorPhone,
            bankAccountNumber,
            registerCode,
            merchantPicture,
            website,
            whatsup,
            facebook,
            twitter,
            instagram,
            merchantSection,
            merchantCategory
          } = req.body;

        // Log the received body
        console.log('Request Body:', req.body);
        // console.log('Request Body ROLE:', role);

        // Check if any of the required fields are missing        
        if (!username || !email || !password || !cin || !city || !phone || !storeName || !storeLogo || !merchantSection || !merchantCategory ) {
            return res.status(400).send('Missing required fields');
        }

        // Check if the user already exists
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).send('User already exists');
        }

        // Hash the password and create a new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User(
            {
                username,
                email,
                password: hashedPassword,
                cin,
                city,
                phone,
                storeName,
                storeLogo,
                country,
                area,
                serviceType,
                supervisorName,
                supervisorPhone,
                bankAccountNumber,
                registerCode,
                merchantPicture,
                website,
                whatsup,
                facebook,
                twitter,
                instagram,
                merchantSection,
                merchantCategory,
                role:{name:"merchant",claims:[]}
              });


        await newUser.save();
        // Generate reset token and expiry
        // newUser.generatePin();


        // Generate a verification token
        const token = jwt.sign({ userId: newUser._id }, EMAIL_SECRET, { expiresIn: '1h' });
        newUser.verificationToken = token;

        //commented to adapt to infinity
        // await sendVerificationEmail(newUser);


        res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });

    } catch (error) {
        console.error('Error registering merchant:', error);
        res.status(500).send('Error registering merchant');
    }
});

// GreenAPI credentials
const idInstance = '7103112403';  // Replace with your GreenAPI instance ID
const apiToken = '034fa50354ad4b0b9ad08ae898620c894a44f82c50f7413bbc';      // Replace with your GreenAPI token

// Function to send OTP to WhatsApp
const sendOtpToWhatsApp = async (otp, recipientNumber) => {
    console.log(otp);
    console.log(recipientNumber);
    console.log(idInstance);
    console.log(apiToken);
    const url = `https://api.green-api.com/waInstance${idInstance}/SendMessage/${apiToken}`;


    const data = {
        chatId: `${recipientNumber}@c.us`.replace(/\+/g, ''),  // WhatsApp number with country code
        message: `Your OTP code is: ${otp}`
    };
    console.log(data.chatId);
    console.log(data.message);

    try {
        const response = await axios.post(url, data);
        return response.data;
    } catch (error) {
        if (error.response) {
            // API responded with an error
            throw new Error(`API Error: ${JSON.stringify(error.response.data)}`);
          } else if (error.request) {
            // No response from the API (network issue)
            throw new Error('No response from GreenAPI');
          } else {
            // Other error
            throw new Error(`Error: ${error.message}`);
          }
    }
};


// Function to send verification email
async function sendVerificationEmail(user) {

    // // Read the HTML file
    // let htmlContent = await fsp.readFile(path.join("./public", 'emailTemplate.html'), 'utf8');

    // // Replace placeholder with actual verification link
    // htmlContent = htmlContent.replace('{{verificationToken}}', user.verificationToken);

    // const mailOptions = {
    //     to: user.email,
    //     from: "bouda996@gmail.com",
    //     subject: 'Email Verification',
    //     html: htmlContent,

    // };
    // transport.sendMail(mailOptions, (err, info) => {
    //     if (err) {
    //         return res.status(500).json({ message: 'Error sending verification email', error: err.message });
    //     }
    // });

    try {

        // Generate reset token and expiry
        user.generatePin();
        await user.save();
        // Send the email
        const mailOptions = {
            to: user.email,
            from: "bouda996@gmail.com",
            subject: 'Your Verification PIN for Secure Login',
            text: `Dear ${user.f_name},\n\nThank you for logging in to Infinite. To ensure the security of your account, we require verification of your email address.\n\nPlease use the following PIN to complete your email verification:\n\nYour Verification PIN: ${user.pin}\n\nIf you did not request this verification, please ignore this email.\n\nFor any assistance, feel free to contact our support team at mabidi@smartlogiq.com .\n\nThank you for choosing Infinite.\n\nBest regards,\n\nThe Infinite Team`,
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

// Route to request OTP
exRoute.post('/request-otp', async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    // Check if user already exists
    let user = await User.findOne({ phone });

    if (!user) return res.status(401).send('User not found');

    // Generate  a 4-digit OTP and expiry
    user.generatePin();
    await user.save();

    const otp = user.pin;

    try {
        // Send OTP to the specified phone number
        await sendOtpToWhatsApp(otp, phone);
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ error: `Failed to send OTP: ${error.message}` });
    }
});

// Route to verify OTP and sign in
exRoute.post('/verify-otp', (req, res) => {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
        return res.status(400).json({ error: 'Phone number and OTP are required' });
    }

    // Check if the OTP matches
    if (otpStore[phoneNumber] && otpStore[phoneNumber] === parseInt(otp)) {
        // OTP is correct, user is signed in
        // Remove the OTP from the store
        delete otpStore[phoneNumber];

        res.status(200).json({ message: 'Sign in successful' });
    } else {
        res.status(401).json({ error: 'Invalid OTP' });
    }
});



/**
 * @swagger
 * /login:
 *   post:
 *     summary: login to your account
 *     description: user login with email and pwd.
 *     responses:
 *       200:
 *         description: Successful response with the user and a token.
 *       400:
 *         description: user not found.
 *       500:
 *         description: Error logging in user + error.
 */
exRoute.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log(email);
        console.log(password);
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send('User not found');

        //adapted to infiniti
        // if (user.user_type == "customer") {
        //     // const token2 = jwt.sign({ userId: user._id }, EMAIL_SECRET, { expiresIn: '1h' });
        //     // console.log("token2");
        //     // console.log(token2);
        //     // user.verificationToken = token2;
        //     await sendVerificationEmail(user);
        // }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).send('Invalid credentials');

        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '7d' });
        res.json({ token, username: user.username, userId: user._id, user: user });
    } catch (error) {
        res.status(500).send('Error logging in user: ' + error);
    }
});


/**
 * @swagger
 * /admin/add-user:
 *   post:
 *     summary: add user to database
 *     description: add user to database.
 *     responses:
 *       200:
 *         description: Successful response with user added successfully by admin.
 *       400:
 *         description: user already exists.
 *       401:
 *         description: missing required fields.
 *       500:
 *         description: Error adding user by admin.
 */
//added for the infinity project
exRoute.post('/admin/add-user', auth, async (req, res) => {
    try {
        const {
            username, email, password, logo, wallet, bankName,
            url, phone, country, user_type, status, city,
            street, building, company_registration
        } = req.body;

        if (!username || !email || !password) {
            return res.status(401).send('Missing required fields');
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).send('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username, email, password: hashedPassword, logo, wallet, bankName,
            url, phone, country, user_type, status, city,
            street, building, company_registration
        });

        await newUser.save();

        res.status(200).send(newUser);

    } catch (error) {
        console.error('Error adding user by admin:', error);
        res.status(500).send('Error adding user by admin');
    }
});


/**
 * @swagger
 * /users/with-user-type:
 *   get:
 *     summary: get list of users by type (merchant)
 *     description: get users list by type.
 *     responses:
 *       200:
 *         description: Successful response with list of users(merchants).
 *       500:
 *         description: Error fetching users with user_type.
 */
exRoute.get('/users/with-user-type', async (req, res) => {
    try {
        const merchants = await User.find({
            'role.name': 'merchant',
            status: { $ne: 'disabled' } // Exclude users with status 'disabled'
        });
        res.json(merchants);
    } catch (error) {
        console.error('Error fetching users with user_type:', error);
        res.status(500).send('Error fetching users with user_type');
    }
});


/**
 * @swagger
 * /users/not-approved:
 *   get:
 *     summary: get list of not approved users
 *     description: get not approved users list where user_type == merchant.
 *     responses:
 *       200:
 *         description: Successful response with list of notApproved users.
 *       500:
 *         description: Error fetching users with status.
 */
exRoute.get('/users/not-approved', async (req, res) => {
    try {
        const users = await User.find({ status: 'notApproved', 'role.name': 'merchant' });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users with status:', error);
        res.status(500).send('Error fetching users with status');
    }
});

/**
 * @swagger
 * /users/approved:
 *   get:
 *     summary: get list of approved users
 *     description: get approved users list where user_type == merchant.
 *     responses:
 *       200:
 *         description: Successful response with list of approved users.
 *       500:
 *         description: Error fetching users with status.
 */
exRoute.get('/users/approved', async (req, res) => {
    try {
        const users = await User.find({
            status: { $in: ['active', 'inactive'] },
            user_type: 'merchant'
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users with status:', error);
        res.status(500).send('Error fetching users with status');
    }
});

/**
 * @swagger
 * /update-status:
 *   post:
 *     summary: update user status
 *     description: update user status by entering the id and the status.
 *     responses:
 *       200:
 *         description: Successful response with sending the user.
 *       404:
 *         description: user not found.
 *       500:
 *         description: Error updating user + error.
 */
// Route to update userStatus
exRoute.post('/update-status', async (req, res) => {
    try {
        const { userId, status } = req.body;

        console.log(userId);
        console.log(status);

        // Find the user by ID and update the userStatus
        const user = await User.findOneAndUpdate(
            { _id: userId }, // Find the user by ID
            { status: status }, // Update the userStatus
            { new: true } // Return the updated document
        );

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.status(200).send('User status has been updated');
    } catch (error) {
        res.status(500).send('Error on the server: ' + error);
    }
});

/**
 * @swagger
 * /disable:
 *   post:
 *     summary: disable user by id
 *     description: update user by id.
 *     responses:
 *       200:
 *         description: Successful response with user status has been updated.
 *       404:
 *         description: user not found.
 *       500:
 *         description: Error on the server + error.
 */
// Route to disable user
exRoute.post('/disable', async (req, res) => {
    try {
        const { userId } = req.body;

        // Find the user by ID and update the userStatus
        const user = await User.findOneAndUpdate(
            { _id: userId }, // Find the user by ID
            { status: "disabled" }, // Update the userStatus
            { new: true } // Return the updated document
        );

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.status(200).send('User status has been updated');
    } catch (error) {
        res.status(500).send('Error on the server: ' + error);
    }
});

/**
 * @swagger
 * /user/:id:
 *   put:
 *     summary: update anyuser by id
 *     description: update any user with id.
 *     responses:
 *       200:
 *         description: Successful response with sending the user.
 *       404:
 *         description: user not found.
 *       500:
 *         description: Error updating user + error.
 */
exRoute.put('/user/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        console.log(req.body);

        const user = await User.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).send('User not found');

        res.send(user);
    } catch (error) {
        res.status(500).send('Error updating user: ' + error);
    }
});
/*************************************************************************************/

/**
 * @swagger
 * /user:
 *   put:
 *     summary: update connected user by token
 *     description: update user with token.
 *     responses:
 *       200:
 *         description: Successful response with sending the user.
 *       404:
 *         description: user not found.
 *       500:
 *         description: Error updating user + error.
 */
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

/**
 * @swagger
 * /:_id/password:
 *   put:
 *     summary: update connected user password by id and token
 *     description: update user password by entering the id, token, the new password and the old one.
 *     responses:
 *       200:
 *         description: Successful response with password updated successfully.
 *       500:
 *         description: Error updating password.
 */
// Update user password
exRoute.put('/:id/password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

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

/**
 * @swagger
 * /password/:_id:
 *   put:
 *     summary: update any user password by id
 *     description: update user password by entering the id and the new password
 *     responses:
 *       200:
 *         description: Successful response with password updated successfully.
 *       500:
 *         description: Error updating password.
 */
// Update any user password
exRoute.put('/password/:id', auth, async (req, res) => {
    const { newPassword } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

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

/**
 * @swagger
 * /user:
 *   delete:
 *     summary: Delete user with token
 *     description: delete user from the database.
 *     responses:
 *       200:
 *         description: Successful response with text user deleted.
 *       500:
 *         description: Error deleteing user.
 */
exRoute.delete('/user', auth, async (req, res) => {
    try {
        const { userId } = req.user;

        await User.findByIdAndDelete(userId);
        res.send('User deleted');
    } catch (error) {
        res.status(500).send('Error deleting user');
    }
});

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get any user with token
 *     description: Retrieve the connected user data from the database with the token.
 *     responses:
 *       200:
 *         description: Successful response with return user.
 *       500:
 *         description: Error Fetching user.
 */
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

/**
 * @swagger
 * /user/:_id:
 *   get:
 *     summary: Get any user by id
 *     description: Retrieve a specific user by their id from the database.
 *     responses:
 *       200:
 *         description: Successful response with a list of users.
 *       500:
 *         description: Error Fetching a list of users.
 */
//get any user by id
exRoute.get('/user/:_id', async (req, res) => {
    try {
        console.log(req.params);
        const { _id } = req.params;
        const user = await User.findById(_id).select('-password');
        if (!user) return res.status(404).send('User not found');
        res.json(user);
    } catch (error) {
        res.status(500).send('Error fetching user');
    }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get a list of users
 *     description: Retrieve a list of users from the database.
 *     responses:
 *       200:
 *         description: Successful response with a list of users.
 *       500:
 *         description: Error Fetching a list of users.
 */
exRoute.get('/users', auth, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).send('Error fetching users');
    }
});

// Route to request password reset
exRoute.post('/forgot-password-mobile', async (req, res) => {
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
      Your password reset PIN is: ${user.pin}\n\n
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

// Route to verify OTP
exRoute.post('/verify-otp', async (req, res) => {
    try {
        const { pin } = req.body;

        const user = await User.findOne({
            pin: pin,
            pinExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).send('OTP is invalid or has expired');
        }

        // OTP is valid, proceed to next step (e.g., allow password reset)
        res.status(200).send('OTP verified successfully');
    } catch (error) {
        res.status(500).send('Error on the server ' + error);
    }
});


// Route to reset password
exRoute.post('/reset-password-mobile', async (req, res) => {

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

/********************** FORGET PWD FOR INFINITY *************************/


exRoute.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send('No user with that email');
        }

        // Generate reset token and expiry
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        // Create the reset link
        const resetLink = `http://localhost:4200/auth/update-password/${resetToken}`;

        // Send the email
        const mailOptions = {
            to: user.email,
            from: "bouda996@gmail.com",
            subject: 'Reset Password Link',
            text: `You are receiving this because you (or someone else) have requested to reset the password for your account.\n\n
      Please click on the following link, or paste it into your browser to complete the process:\n\n
      ${resetLink}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };

        transport.sendMail(mailOptions, (err) => {
            if (err) {
                return res.status(500).send('Error sending email: ' + err);
            }
            res.status(200).send('Password reset email sent');
        });
    } catch (error) {
        res.status(500).send('Error on the server: ' + error);
    }
});


exRoute.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // Check if token is still valid
        });

        if (!user) {
            return res.status(400).send('Password reset token is invalid or has expired');
        }

        // Set the new password
        user.password = bcrypt.hashSync(password, 10); // Make sure to hash the password before saving
        user.resetPasswordToken = undefined; // Clear the reset token and expiry
        user.resetPasswordExpires = undefined;

        await user.save();
        res.status(200).send('Password has been reset');
    } catch (error) {
        res.status(500).send('Error on the server: ' + error);
    }
});

/************************************************************************/

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
'use strict';
const express = require('express');
const exRoute = express.Router();

const app = express();
const cors = require('cors');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/auth'); // Import the auth middleware



// const MONGO_URI = 'mongodb+srv://mohamedabidi:G25uLQMzh18fiKA0@slcluster.opmphm7.mongodb.net/?retryWrites=true&w=majority&appName=SLCluster';
const MONGO_URI = 'mongodb+srv://bouda996:SGVSNwxBaVVubMdC@yummyuser.h2ltahd.mongodb.net/?retryWrites=true&w=majority&appName=yummyuser';
// const SECRET_KEY = '9f45e9d85c0c552ce01aeebd9db0da30918f941ea2381e758fc1f49254a033e0';
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

exRoute.put('/user',  auth, async (req, res) =>{
    try {
        const { userId } = req.user;

        await User.findByIdAndUpdate(
            userId,
            req.body,
            { new: true });
        res.send('User updated');
    } catch (error) {
        res.status(500).send('Error updating user');
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

exRoute.use('/test', function (req, res, next) {
    console.log("crud working");
    res.sendStatus(404);
})

module.exports = exRoute;
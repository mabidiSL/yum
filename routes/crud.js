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
        console.log(username);
        console.log(email);
        console.log(password);

        const user = await User.findOne({ email });
        if (!user) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({ username, email, password: hashedPassword });
            await newUser.save();
            res.status(201).send('User registered');
        } else { return res.status(400).send('User already exists'); }


    } catch (error) {
        res.status(500).send('Error registering user');
        console.log(error);
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

exRoute.post('/update', function (req, res, next) {
    connection.execute("UPDATE users SET name=?, surName=? WHERE id=?;",
        [req.body.name, req.body.surName, req.body.id])
        .then(() => {
            console.log('ok');
        }).catch((err) => {
            console.log(err);
        });
    res.end();
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
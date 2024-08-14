const express = require('express');

const LaunchDetail = require('../models/launch_details');
const app = express();
const aRoute = express.Router();

const cors = require('cors');


const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://bouda996:SGVSNwxBaVVubMdC@yummyuser.h2ltahd.mongodb.net/?retryWrites=true&w=majority&appName=yummyuser';

// Connect to MongoDB
mongoose.connect(MONGO_URI);

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint to post launch details
aRoute.post('/launch-details', async (req, res) => {
    try {
        const { time, location } = req.body;
        const launchDetail = new LaunchDetail({ time, location });
        await launchDetail.save();
        res.status(201).send(launchDetail);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Endpoint to get all launch details
aRoute.get('/launch-details', async (req, res) => {
    try {
        const launchDetails = await LaunchDetail.find({});
        res.status(200).send(launchDetails);
    } catch (error) {
        res.status(500).send(error);
    }
});


module.exports = aRoute;
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const aRoute = express.Router();

const cors = require('cors');



// Middleware
app.use(cors());
app.use(express.json());

let launchDetails = [];

// Endpoint to post time and location
app.post('/launch-details', (req, res) => {
    const { date, location } = req.body;

    // Save the launch details
    launchDetails.push({ date, location });

    res.status(201).send('Launch details saved successfully');
});

// Endpoint to get the launch details
app.get('/launch-details', (req, res) => {
    res.status(200).json(launchDetails);
});


module.exports = xRoute;
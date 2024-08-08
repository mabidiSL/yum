const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const xRoute = express.Router();

const cors = require('cors');



// Middleware
app.use(cors());
app.use(express.json());

// Serve HTML content through an API endpoint
xRoute.get('/terms-and-conditions', async (req, res) => {
    try {
        console.log("terms-and-conditions working");
        const filePath = path.join("./public", 'terms-and-conditions.html');

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.status(500).send('500 Internal Server Error'+err);
                return;
            }
            res.setHeader('Content-Type', 'text/html');
            res.send(data);
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Serve HTML content through an API endpoint
xRoute.get('/privacy-policy', async (req, res) => {
    try {
        console.log("privacy-policy working");

        const filePath = path.join("./public", 'privacy-policy.html');

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.status(500).send('500 Internal Server Error'+err);
                return;
            }
            res.setHeader('Content-Type', 'text/html');
            res.send(data);
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



module.exports = xRoute;
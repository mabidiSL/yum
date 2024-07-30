'use strict';
const express = require('express');
const rxRoute = express.Router();

const app = express();
const cors = require('cors');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const transport = require('../config/nodemailer');
const jwt = require('jsonwebtoken');
const UserRecipe = require('../models/user_recipe');
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

//create recipe
rxRoute.post('/recipe', auth, async (req, res) => {

    console.log('Request Body:', req.body);

    try {
        const recipe = new UserRecipe(req.body);
        await recipe.save();
        res.status(201).json(recipe);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

//get recipes
rxRoute.get('/recipe', async (req, res) => {
    try {
        const recipes = await UserRecipe.find();
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//update recipe
rxRoute.put('/recipe', auth, async (req, res) => {
    try {
        const { _id } = req.body;
        console.log(req.body);
        await UserRecipe.findByIdAndUpdate(
            _id,
            req.body,
            { new: true });
        res.send('Recipe updated');
    } catch (error) {
        res.status(500).send('Error updating recipe ' + error);
    }
});

//delete recipe
rxRoute.delete('/recipe', auth, async (req, res) => {
    try {
        const { _id } = req.body;

        await UserRecipe.findByIdAndDelete(_id);
        res.send('recipe deleted');
    } catch (error) {
        res.status(500).send('Error deleting user');
    }
});


//testing api
rxRoute.use('/test', function (req, res, next) {
    console.log("crud Recipe working");
    res.sendStatus(404);
})

module.exports = rxRoute;
const express = require('express');

const RecipeComment = require('../models/recipe_comment');
const app = express();
const sRoute = express.Router();

const cors = require('cors');


const mongoose = require('mongoose');

const auth = require('../middleware/auth'); // Import the auth middleware


const MONGO_URI = 'mongodb+srv://bouda996:SGVSNwxBaVVubMdC@yummyuser.h2ltahd.mongodb.net/?retryWrites=true&w=majority&appName=yummyuser';

// Connect to MongoDB
mongoose.connect(MONGO_URI);

// Middleware
app.use(cors());
app.use(express.json());

sRoute.post('/recipes/comments', auth, async (req, res) => {
    try {
        // Find the RecipeComment document by recipeId
        let recipeComment = await RecipeComment.findOne({ recipeId: req.body.recipeId });

        // If no document exists, create a new one
        if (!recipeComment) {
            recipeComment = new RecipeComment({ recipeId: req.body.recipeId, comments: [] });
        }

        // Add the new comment to the comments array
        const newComment = {
            text: req.body.text,
            userId: req.body.userId,
            userName: req.body.userName,
            userImage: req.body.userImage,
        };
        recipeComment.comments.push(newComment);

        // Save the updated document
        await recipeComment.save();

        res.status(201).send(recipeComment);
    } catch (error) {
        res.status(400).send({ error: 'Unable to add comment.' + error });
    }
});

sRoute.get('/recipes/comments', auth, async (req, res) => {
    try {
        const { recipeId } = req.query.recipeId;

        console.log(recipeId);
        const comment = await RecipeComment.findOne({ recipeId });
        if (!comment) return res.status(400).send('comment not found');


        res.json({ comment });
    } catch (error) {
        res.status(500).send('Error logging in user: ' + error);
    }
});




module.exports = sRoute;
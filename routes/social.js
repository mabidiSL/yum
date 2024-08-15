const express = require('express');

const RecipeComment = require('../models/recipe_comment');
const User = require('../models/user');
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

sRoute.get('/recipes/:recipeId/comments', async (req, res) => {
    try {

        console.log(req.params);
        const { recipeId } = req.params;

        const comment = await RecipeComment.findOne({ recipeId });
        if (!comment) return res.status(400).send('comment not found');


        res.json({ comment });
    } catch (error) {
        res.status(500).send('Error getting recipe: ' + error);
    }
});


// following user system

//to follow
const followUser = async (userId, followUserId) => {
    try {

        console.log(followUserId);
        console.log(userId);
        // Add followUserId to the 'following' array of the current user
        await User.findByIdAndUpdate(userId, { $addToSet: { following: followUserId } });

        // Add userId to the 'followers' array of the followUserId
        await User.findByIdAndUpdate(followUserId, { $addToSet: { followers: userId } });

        console.log('Successfully followed the user');
    } catch (error) {
        console.error('Error following the user follow function :', error);
    }
};

//to unfollow
const unfollowUser = async (userId, unfollowUserId) => {
    try {
        // Remove unfollowUserId from the 'following' array of the current user
        await User.findByIdAndUpdate(userId, { $pull: { following: unfollowUserId } });

        // Remove userId from the 'followers' array of the unfollowUserId
        await User.findByIdAndUpdate(unfollowUserId, { $pull: { followers: userId } });

        console.log('Successfully unfollowed the user');
    } catch (error) {
        console.error('Error unfollowing the user unfollow function:', error);
    }
};

//get followers and followed List
const getUserWithFollowersAndFollowing = async (userId) => {
    try {
        const user = await User.findById(userId)
            .populate('followers', 'username')
            .populate('following', 'username')
            .exec();

        console.log('User:', user);
    } catch (error) {
        console.error('Error retrieving user data:', error);
    }
};


sRoute.post('/user/follow', auth, async (req, res) => {
    const userId = req.body.userId; // ID of the current user
    const followUserId = req.body.followedId; // ID of the user to follow
    try {
        await followUser(userId, followUserId);
        res.status(200).send('Followed the user');
    } catch (error) {
        res.status(500).send('Error following the user', error);
    }
});

sRoute.post('/user/unfollow', auth, async (req, res) => {
    const userId = req.body.userId; // ID of the current user
    const unfollowUserId = req.body.followedId; // ID of the user to unfollow
    try {
        await unfollowUser(userId, unfollowUserId);
        res.status(200).send('Unfollowed the user');
    } catch (error) {
        res.status(500).send('Error unfollowing the user', error);
    }
});

// sRoute.get('/user/:id', auth, async (req, res) => {
//     const userId = req.params.id;

//     try {
//         const user = await getUserWithFollowersAndFollowing(userId);
//         res.status(200).json(user);
//     } catch (error) {
//         res.status(500).send('Error retrieving user data');
//     }
// });





module.exports = sRoute;
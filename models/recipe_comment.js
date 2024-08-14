const mongoose = require('mongoose');

const commentSchema = require('./comment').schema;

const recipeCommentSchema = new mongoose.Schema({

    recipeId: {
        type: String,
        required: true,
    },

    comments: [commentSchema],
});

module.exports = mongoose.model('RecipeComment', recipeCommentSchema);
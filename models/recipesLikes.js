const mongoose = require('mongoose');

const RecipeLikesSchema = new mongoose.Schema({
    recipeId: {
    type: String,
    required: true,
  },
  likesNumber: {
    type: String,
    required: true,
    default: "1"
  },
});

module.exports = mongoose.model('RecipeLikes', RecipeLikesSchema);
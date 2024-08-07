const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  idMeal: {
    type: String,
    required: true,
  },
  strMeal: {
    type: String,
    required: true,
  },
  strMealThumb: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Recipe', RecipeSchema);
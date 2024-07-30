const mongoose = require('mongoose');

const { Schema } = mongoose;

const userRecipeSchema = new Schema({
  idMeal: { type: String, required: false },
  idUser: { type: String, required: true },
  strMeal: { type: String, required: true },
  strDrinkAlternate: { type: String, required: false },
  strCategory: { type: String, required: true },
  duration: { type: Number, required: true },
  nuOfServing: { type: Number, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  strArea: { type: String, required: true },
  strInstructions: { type: String, required: true },
  strMealThumb: { type: String, required: true },
  strTags: { type: [String], required: false },
  steps: { type: [String], required: true },
  websiteUrl: { type: String, required: true },
  strYoutube: { type: String, required: true },
  languageCode: { type: String, required: true },
  strIngredients: { type: [String], required: true },
  strMeasures: { type: [String], required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Recipe = mongoose.model('UserRecipe', userRecipeSchema);

module.exports = Recipe;

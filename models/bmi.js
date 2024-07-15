const mongoose = require('mongoose');

const BMISchema = new mongoose.Schema({
  bmi: {
    type: String,
    required: true,
  },
  age: {
    type: String,
    required: true,
  },
  height: {
    type: String,
    required: true,
  },
  weight: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('BMI', BMISchema);
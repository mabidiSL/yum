const mongoose = require('mongoose');

const ClaimsSchema = new mongoose.Schema({
  type: {
    type: Number,
  },
  value: {
    type: Number,
  },
});

module.exports = mongoose.model('Claims', ClaimsSchema);
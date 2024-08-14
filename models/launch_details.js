const mongoose = require('mongoose');

const launchDetailSchema = new mongoose.Schema({
    time: { type: Date, required: true },
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LaunchDetail', launchDetailSchema);
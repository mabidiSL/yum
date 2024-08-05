const mongoose = require('mongoose');

const PhoneSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true,
        default: ""
    },
    countryCode: {
        type: String,
        required: true,
        default: ""
    },
});

module.exports = mongoose.model('Phone', PhoneSchema);
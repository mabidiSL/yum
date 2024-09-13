
const ClaimsSchema = require('./claims').schema;

const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    claims: [ClaimsSchema],
});

module.exports = mongoose.model('Role', RoleSchema);
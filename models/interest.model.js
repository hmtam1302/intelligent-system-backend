const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema({
    userId: { type: String, required: True },
    movieIds: { type: Array }
})

const Interest = mongoose.model('Interest', interestSchema);

module.exports = { Interest };
const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    movieIds: { type: Array }
})

interestSchema.statics.getInterestedMovie = async function () {
    const movies = await this.find({}, {
        "movieIDs": 1,
        "_id": 0
    })
    return movies
}

const Interest = mongoose.model('Interest', interestSchema, 'interests');

module.exports = { Interest };
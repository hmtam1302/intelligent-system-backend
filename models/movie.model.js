const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    movieId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    genres: { type: String, required: true }
})

movieSchema.statics.getMovie = async function(name) {
    const movies = await this.find({
        title: { $regex: name, $options: 'i' }
    });
    return movies;
}

movieSchema.statics.getMovieByTheme = async function(theme) {
    const movies = await this.find({
        genres: { $regex: theme, $options: 'i' }
    }).limit(10);
    return movies;
}

const Movie = mongoose.model('Movie', movieSchema, 'movies');

module.exports = { Movie };
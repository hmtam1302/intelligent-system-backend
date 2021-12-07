const mongoose = require('mongoose');
const db = require('../start/dbConnect');
const { Movie } = require('./movie.model');

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  first_name: { type: String },
  last_name: { type: String },
  address: { type: String },
  account_type: { type: String },
  phone: { type: String, required: true },
  visa: { type: String },
  support: { type: Number, required: true, default: 0.8 },
  confidence: { type: Number, required: true, default: 0.2 },
  favorite: { type: Array, required: false, default: [] },
  img: { type: String }
})

UserSchema.statics.login = async function (username) {
  const user = await this.findOne({ username: username });
  return user;
}

UserSchema.statics.getUser = async function (username) {
  const user = await this.findOne({ username });
  return user;
}

UserSchema.statics.searchMovie = async function (movieName) {
  const movies = await Movie.getMovie(movieName);
  return movies;
}

UserSchema.statics.groupMovie = async function (theme) {
  const movies = await Movie.getMovieByTheme(theme);
  return movies;
}

UserSchema.statics.updateApriori = async function (userId, support, confidence) {
  const filter = { userId: userId };
  const update = {
    support: support,
    confidence: confidence
  }
  const option = {
    new: true
  }
  const user = await this.findOneAndUpdate(filter, update, option);
  console.log(user);
  return user ? true : false;
}

UserSchema.statics.updateUser = async function (username, changes) {
  const filter = { username };
  const update = {
    ...changes
  }
  const option = {
    new: true
  }
  const user = await this.findOneAndUpdate(filter, update, option);
  return user ? true : false;
}

const User = mongoose.model('User', UserSchema, 'user');

module.exports = { User };
const express = require('express');
const router = express.Router();
const { User } = require('../models/user.model');
const { spawn } = require('child_process');

//Login
router.post('/login', async (req, res) => {
  console.log('==== Post customer login information ====');
  const username = req.body.username;
  const password = req.body.password;
  const user = await User.login(username);
  if (user === null) {
    res.status(500).send({ message: 'Wrong user name or password!' });
  }
  else {
    if (user.password !== password) {
      res.status(500).send({ message: 'Wrong user name or password!' });
    }
    else {
      console.log('---- Success ----');
      res.status(200).send({ message: user.userId });
    }
  }
})

//Update user information
router.put('/update/:username', async (req, res) => {
  console.log('==== Update customer information ====');
  const username = req.params.username;
  const changes = req.body.changes;
  const response = await User.updateUser(username, changes);
  if (response) {
    res.status(200).send({ message: 'Update information success' })
  } else {
    res.status(500).send({ message: 'Update information failed' });
  }
})

// Get customer information
router.get('/info/:id', async (req, res) => {
  console.log('==== Get customer information ====');
  const id = req.params.id;
  const info = await User.getUser(id);
  if (info === null) {
    res.status(400).send('Invalid user');
  }
  else {
    console.log('---- Success ----');
    res.status(200).send(info);
  }
})

// Get movie with name
router.post('/search', async (req, res) => {
  console.log('==== Search movie ====');
  const name = req.body.name;
  const movies = await User.searchMovie(name);
  if (movies === null) {
    res.status(200).send('No results found!');
  }
  else {
    console.log('---- Success ----');
    res.status(200).send(movies);
  }
})

// Group movie with theme
router.post('/movie', async (req, res) => {
  console.log('==== Group movie by theme ====');
  const theme = req.body.theme;
  const movies = await User.groupMovie(theme);
  if (movies === null) {
    res.status(200).send('No results found!');
  }
  else {
    console.log('---- Success ----');
    res.status(200).send(movies);
  }
})

/// Get apriori arguments
router.get('/apriori/argument/:id', async (req, res) => {
  console.log('==== Get apriori arguments ====')
  const id = req.params.id
  const response = await User.getApriori(id)
  if (response === null) {
    res.status(400).send('Invalid user!');
  } else {
    console.log('---- Success ----');
    res.status(200).send(response);
  }
})

// Update apriori arguments
router.post('/apriori/argument', async (req, res) => {
  console.log('==== Update apriori arguments ====')
  const id = req.body.id
  const support = req.body.support
  const confidence = req.body.confidence
  const response = await User.updateApriori(id, support, confidence)
  if (response === true) {
    console.log('---- Success ----')
    res.send(200).send('Success')
  } else {
    res.send(400).send('Invalid apriori argument')
  }
})

// Get associate rules
router.post('/apriori/recommend', async (req, res) => {
  console.log('==== Get recommend movie by apriori algorithm ====')
  const id = req.body.username
  const movieId = req.body.movieId

  const user = await User.getUser(id)

  let minSupport = user.support
  let minConfidence = user.confidence
  let result = ''
  const process = await spawn('python', ['./utils/associate_rule_mining.py', minSupport, minConfidence, movieId])
  await process.stdout.on('data', function (data) {
    result += data.toString()
    result = result.substring(result.indexOf("[") + 1, result.indexOf("]"))
    result = result.split(",").map(item => item.trim())
    console.log('---- Success ----')
    res.status(200).send(result)
  })
})

// Get info of movies
router.post('/movie/get', async (req, res) => {
  console.log('==== Get movie info by id ====')
  const ids = req.body.ids
  const movies = await User.findMovies(ids);
  if (movies === null) {
    res.status(200).send('No results found!')
  } else {
    console.log('---- Success ----')
    res.status(200).send(movies)
  }
})

router.get('/test', async (req, res) => {

})

module.exports = router

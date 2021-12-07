const express = require('express');
const router = express.Router();
const { User } = require('../models/user.model');

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

// Update apriori argument
router.post('/apriori/argument', async (req, res) => {
  console.log('==== Update apriori argument ====');
  const id = req.body.id;
  const support = req.body.support;
  const confidence = req.body.confidence;
  const response = await User.updateApriori(id, support, confidence);
  if (response === true) {
    console.log('---- Success ----');
    res.send(200).send('Success');
  }
  else {
    res.send(400).send('Invalid apriori argument');
  }
})

module.exports = router;
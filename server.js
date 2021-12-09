const express = require('express');
const app = express();
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cors());

require('./start/dbConnect')();
require('./start/router')(app);

// default route
app.get('/', async function (req, res) {
  res.send({ message: 'Welcome to IS Server' });
});

dotenv.config();
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log("Server started!");
})

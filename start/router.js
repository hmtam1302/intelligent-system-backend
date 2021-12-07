const express = require('express');
const user = require('../routers/user.router');

module.exports = (app) => {
    app.use(express.json());
    app.use("/user", user);
}
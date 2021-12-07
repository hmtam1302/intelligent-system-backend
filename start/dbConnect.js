const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

module.exports = () => {
    const db = process.env.DB;
    return mongoose
        .connect(db)
        .then(() => {
            console.log('Database connected!');
        })
        .catch((err) => {
            console.log(err);
        })
}
const mongoose = require('mongoose');
const { Schema } = mongoose;

const author_scheme = new Schema({
    authorId: Number,
    username: String,
    password: String,
    email: String,
    about: String,
    pronouns: String,
    Admin: Boolean
});

module.exports = {
    author_scheme
}
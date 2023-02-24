const mongoose = require('mongoose');
const { Schema } = mongoose;

const crypto = require('crypto');

const author_scheme = new Schema({
    _id: {type: String, default: crypto.randomUUID},
    username: String,
    password: String,
    email: String,
    about: String,
    pronouns: String,
    admin: Boolean,},
    {versionKey: false
});

const login_scheme = new Schema({
    authorId: String,
    username: String,
    token: String,
    admin: Boolean,
    expires: String,},
    {versionKey: false
});

module.exports = {
    author_scheme,
    login_scheme
}
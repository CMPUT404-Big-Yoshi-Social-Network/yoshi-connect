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

const follower_scheme = new Schema({
    username: String,
    followers: [{
        username: String,
        authorId: String
    }]},
    {versionKey: false
});

const following_scheme = new Schema({
    username: String,
    followings: [{
        username: String,
        authorId: String
    }]},
    {versionKey: false
});

const friend_scheme = new Schema({
    username: String,
    friends: [{
        username: String,
        authorId: String
    }]},
    {versionKey: false
});

const request_scheme = new Schema({
    senderId: String,
    receiverId: String,
    rId: String,
    status: String},
    {versionKey: false
});

module.exports = {
    author_scheme,
    login_scheme,
    friend_scheme,
    following_scheme,
    follower_scheme,
    request_scheme
}
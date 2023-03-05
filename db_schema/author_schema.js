const mongoose = require('mongoose');
const { Schema } = mongoose;
const database = mongoose.connection;

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
    authorId: String,
    followers: [{
        username: String,
        authorId: String
    }]},
    {versionKey: false
});

const following_scheme = new Schema({
    username: String,
    authorId: String,
    followings: [{
        username: String,
        authorId: String
    }]},
    {versionKey: false
});

const friend_scheme = new Schema({
    username: String,
    authorId: String,
    friends: [{
        username: String,
        authorId: String
    }]},
    {versionKey: false
});

const request_scheme = new Schema({
    senderId: String,
    senderUUID: String,
    receiverId: String,
    receiverUUID: String,
    status: String},
    {versionKey: false
});

const Friend = database.model('Friend', friend_scheme);
const Following = database.model('Following', following_scheme);
const Login = database.model('Login', login_scheme);
const Author = database.model('Author', author_scheme);
const Request = database.model('Request', request_scheme);
const Follower = database.model('Follower', follower_scheme);

module.exports = {
    Friend,
    Following,
    Login,
    Author,
    Request,
    Follower
}
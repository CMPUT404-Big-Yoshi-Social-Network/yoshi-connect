const mongoose = require('mongoose');
const { Schema } = mongoose;
const database = mongoose.connection;

const crypto = require('crypto');

const author_scheme = new Schema({
    type: 'author',
    _id: {type: String, default: crypto.randomUUID},
    url: String,
    host: String,
    displayName: String,
    github: String,
    profileImage: String},
    {versionKey: false
});

const authors_scheme = new Schema({
    type: 'authors',
    items: [author_scheme],
    _id: {type: String, default: crypto.randomUUID}},
    {versionKey: false
});

const account_scheme = new Schema({
    type: 'account',
    _id: {type: String, default: crypto.randomUUID},
    displayName: String,
    password: String,
    email: String,
    about: String,
    pronouns: String,
    admin: Boolean},
    {versionKey: false
});

const login_scheme = new Schema({
    type: 'login',
    authorId: String,
    token: String,
    expires: String,
    admin: Boolean},
    {versionKey: false
});

const follower_scheme = new Schema({
    type: 'followers',
    authorId: String,
    items: [author_scheme]},
    {versionKey: false
});

const following_scheme = new Schema({
    type: 'followings',
    authorId: String,
    items: [author_scheme]},
    {versionKey: false
});

const friend_scheme = new Schema({
    type: 'friends',
    authorId: String,
    items: [author_scheme]},
    {versionKey: false
});

const request_scheme = new Schema({
    type: String,
    summary: String,
    actor: author_scheme,
    object: author_scheme},
    {versionKey: false
});

const Friend = database.model('Friend', friend_scheme);
const Following = database.model('Following', following_scheme);
const Login = database.model('Login', login_scheme);
const Author = database.model('Author', author_scheme);
const Request = database.model('Request', request_scheme);
const Follower = database.model('Follower', follower_scheme);
const Account = database.model('Account', account_scheme);
const Authors = database.model('Authors', authors_scheme);

module.exports = {
    Friend,
    Following,
    Login,
    Author,
    Request,
    Follower,
    Account
}
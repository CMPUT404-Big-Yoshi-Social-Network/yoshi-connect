const mongoose = require("mongoose");
const { Schema } = mongoose;
const crypto = require('crypto');
const database = mongoose.connection;

const commentScheme = new Schema({
    type: String,
    _id: {type: String, default: crypto.randomUUID}, // http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/de305d54-75b4-431b-adb2-eb6b9e546013/comments/f6255bb01c648fe967714d52a89e8e9c
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'Author'},
    comment: String,
    contentType: String,
    published: String},
    {versionKey: false
})

const commentsScheme = new Schema({
    type: String,
    page: Number,
    size: Number,
    post: String, // "http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/764efa883dda1e11db47671c4a3bbd9e"
    _id: {type: String, default: crypto.randomUUID}, // "http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/de305d54-75b4-431b-adb2-eb6b9e546013/comments"
    comments: [commentScheme]},
    {versionKey: false
})

const likeScheme = new Schema({
    '@context': String,
    summary: String, // "Lara Croft Likes your post"
    type: String,
    _id: {type: String, default: crypto.randomUUID},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'Author'},
    object: String}, // "http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/764efa883dda1e11db47671c4a3bbd9e"
    {versionKey: false
})

const likesScheme = new Schema({
    type: String,
    _id: {type: String, default: crypto.randomUUID},
    items: [likeScheme]},
    {versionKey: false
})

const Comments = database.model('Comments', commentsScheme);
const Comment = database.model('Comment', commentScheme);
const Like = database.model('Like', likesScheme);
const Likes = database.model('Likes', likeScheme);

module.exports = {
    Comments,
    Comment,
    Like,
    Likes
}
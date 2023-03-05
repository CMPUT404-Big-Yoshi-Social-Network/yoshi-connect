const mongoose = require("mongoose");
const { Schema } = mongoose;
const database = mongoose.connection;
const crypto = require('crypto');

const postScheme = new Schema({
    type: String,
    _id: {type: String, default: crypto.randomUUID}, // "http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/764efa883dda1e11db47671c4a3bbd9e"
    title: String,
    description: String,
    source: String,
    origin: String,
    contentType: String,
    content: String,
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'Author'},
    categories: [String],
    count: Number,
    commentsSrc: {type: mongoose.Schema.Types.ObjectId, ref: 'Comments'},
    comments: String, // "http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/de305d54-75b4-431b-adb2-eb6b9e546013/comments"
    published: String,
    visibility: String,
    unlisted: Boolean,
    likesSrc: {type: mongoose.Schema.Types.ObjectId, ref: 'Likes'},
    specifics: [{type: mongoose.Schema.Types.ObjectId, ref: 'Author'}],
    image: String},
    {versionKey: false
});

const postHistoryScheme = new Schema({
    _id: {type: String, default: crypto.randomUUID},
    authorId: String,
    numPosts: Number,
    posts: [postScheme]},
    {versionKey: false
})

const inboxScheme = new Schema({
    type: String,
    _id: {type: String, default: crypto.randomUUID},
    author: String,
    items: [postScheme]},
    {versionKey: false
});

const Inbox = database.model('Inbox', inboxScheme);
const PostHistory = database.model('Posts', postHistoryScheme);
const Post = database.model('Post', postScheme);

module.exports = {
    PostHistory,
    Post,
    Inbox
}
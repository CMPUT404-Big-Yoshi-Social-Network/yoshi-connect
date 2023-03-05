const mongoose = require("mongoose");
const { Schema } = mongoose;
const database = mongoose.connection;
const crypto = require('crypto');

const post_scheme = new Schema({
    type: 'post',
    _id: String, // "http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/764efa883dda1e11db47671c4a3bbd9e"
    title: String,
    description: String,
    source: String,
    origin: String,
    contentType: String,
    content: String,
    author: Author,
    categories: [String],
    count: Number,
    commentsSrc: Comments,
    comments: String, // "http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/de305d54-75b4-431b-adb2-eb6b9e546013/comments"
    published: String,
    visibility: String,
    unlisted: Boolean,
    likesSrc: Likes,
    specifics: [Author],
    image: String},
    {versionKey: false
});

const post_history_scheme = new Schema({
    _id: {type: String, default: crypto.randomUUID},
    authorId: String,
    num_posts: Number,
    posts: [post_scheme]},
    {versionKey: false
})

const inbox_scheme = new Schema({
    type: 'inbox',
    _id: {type: String, default: crypto.randomUUID},
    author: String,
    items: [post_scheme]},
    {versionKey: false
});

const Post_History = database.model('Posts', post_history_scheme);
const Inbox = database.model('Inbox', inbox_scheme);
const Post = database.model('Post', post_scheme);

module.exports = {
    Post_History,
    Post,
    Inbox
}
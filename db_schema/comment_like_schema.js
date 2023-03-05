const mongoose = require("mongoose");
const { Schema } = mongoose;
const crypto = require('crypto');
const { Author } = require("./author_schema");

const comment_scheme = new Schema({
    type: 'comment',
    _id: {type: String, default: crypto.randomUUID}, // http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/de305d54-75b4-431b-adb2-eb6b9e546013/comments/f6255bb01c648fe967714d52a89e8e9c
    author: Author,
    comment: String,
    contentType: String,
    published: String},
    {versionKey: false
})

const comments_scheme = new Schema({
    type: 'comments',
    page: Number,
    size: Number,
    post: String, // "http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/764efa883dda1e11db47671c4a3bbd9e"
    _id: {type: String, default: crypto.randomUUID}, // "http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/de305d54-75b4-431b-adb2-eb6b9e546013/comments"
    comments: [comment_scheme]},
    {versionKey: false
})

const like_scheme = new Schema({
    '@context': String,
    summary: String, // "Lara Croft Likes your post"
    type: 'Like',
    _id: {type: String, default: crypto.randomUUID},
    author: Author,
    object: String}, // "http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/764efa883dda1e11db47671c4a3bbd9e"
    {versionKey: false
})

const likes_scheme = new Schema({
    type: 'liked',
    _id: {type: String, default: crypto.randomUUID},
    items: [like_scheme]},
    {versionKey: false
})

const Comments = database.model('Comments', comments_scheme);
const Comment = database.model('Comment', comment_scheme);
const Like = database.model('Like', likes_scheme);
const Likes = database.model('Likes', like_scheme);

module.exports = {
    Comments,
    Comment,
    Like,
    Likes
}
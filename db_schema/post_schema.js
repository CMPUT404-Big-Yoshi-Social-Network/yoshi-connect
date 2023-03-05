const mongoose = require("mongoose");
const { Schema } = mongoose;
const { request_scheme} = require("./author_schema.js");
const database = mongoose.connection;
const crypto = require('crypto');

const comment_scheme = new Schema({
    _id: {type: String, default: crypto.randomUUID},
    commenter: String,
    comment: String
})

const like_scheme = new Schema({
    _id: {type: String, default: crypto.randomUUID},
    liker: String
})

const post_scheme = new Schema({
    _id: {type: String, default: crypto.randomUUID},
    title: String,
    description: String,
    contentType: String,
    content: String,
    categories: [String],
    count: Number,
    likes: [like_scheme],
    comments: [comment_scheme],
    published: String,
    visibility: String,
    specifics: [String],
    unlisted: Boolean,
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
    _id: {type: String, default: crypto.randomUUID},
    authorId: String,
    username: String,
    posts: [post_scheme],
    likes: [like_scheme],
    comments: [comment_scheme],
    requests: [request_scheme]},
    {versionKey: false
})

const PostHistory = database.model('Posts', post_history_scheme);
const Post = database.model('Post', post_scheme);
const Like = database.model('Like', like_scheme);
const Comment = database.model('Comment', comment_scheme);
const Inbox = database.model('Inbox', inbox_scheme);
module.exports = {
    inbox_scheme,
    post_history_scheme,
    post_scheme,
    PostHistory,
    Post,
    Like,
    Comment,
    Inbox
}
const mongoose = require("mongoose");
const { Schema } = mongoose;
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

const PostHistory = database.model('Posts', post_history_scheme);
const Post = database.model('Post', post_scheme);
const Like = database.model('Like', like_scheme);
const Comment = database.model('Comment', comment_scheme);

module.exports = {
    PostHistory,
    Post,
    Like,
    Comment
}
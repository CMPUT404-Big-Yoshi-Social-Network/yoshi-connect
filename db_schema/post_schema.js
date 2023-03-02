const mongoose = require("mongoose");
const { Schema } = mongoose;

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
module.exports = {
    post_scheme,
    post_history_scheme,
    like_scheme,
    comment_scheme
}
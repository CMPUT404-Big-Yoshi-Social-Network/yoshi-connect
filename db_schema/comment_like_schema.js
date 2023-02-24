const mongoose = require("mongoose");
const { Schema } = mongoose;
const { author_scheme} = require('./author_schema.js');
const { post_scheme } = require('./post_schema.js');

const crypto = require('crypto');

const comment_scheme = new Schema({
    _id: {type: String, default: crypto.randomUUID},
    authorId: Number,
    comment: String,
    contentType: String,
    published: String},
    {versionKey: false
})

const comments_scheme = new Schema({
    _id: {type: String, default: crypto.randomUUID},
    postId: ObjectID,
    num_of_comments: Number,
    comments: [comment_scheme],
    likes: Number},
    {versionKey: false
})

const like_scheme = new Schema({
    _id: {type: String, default: crypto.randomUUID},
    authorId: Number,
    postId: Number,
    commentId: Number},
    {versionKey: false
})

const likes_scheme = new Schema({
    _id: {type: String, default: crypto.randomUUID},
    postId: ObjectID,
    likes: [like_scheme]},
    {versionKey: false
})

module.exports = {
    comment_scheme,
    comments_scheme,
    like_scheme,
    likes_scheme},
    {versionKey: false
}
const mongoose = require("mongoose");
const { Schema } = mongoose;

const crypto = require('crypto');

const post_scheme = new Schema({
    _id: {type: String, default: crypto.randomUUID},
    title: String,
    description: String,
    contentType: String,
    content: String,
    categories: [String],
    count: Number,
    comments: String,
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
    post_history_scheme
}
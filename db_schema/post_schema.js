const mongoose = require("mongoose");
const { Schema } = mongoose;
const { author_scheme} = require('../db_schema/author_schema.js');

const post_scheme = new Schema({
    authorID: String,
    title: String,
    description: String,
    contentType: String,
    content: String,
    author: author_scheme,
    categories: [String],
    count: Number,
    comments: String,
    publised: String,
    visibility: String,
    unlisted: Boolean
});

module.exports = {
    post_scheme
}
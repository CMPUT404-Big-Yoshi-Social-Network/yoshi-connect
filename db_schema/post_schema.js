const mongoose = require("mongoose");
const { Schema } = mongoose;
const { author_scheme} = require('../db_schema/author_schema.js');

const post_scheme = new Schema({
    title: String,
    description: String,
    contentType: String,
    content: String,
    authorId: Number,
    categories: [String],
    count: Number,
    comments: String,
    published: String,
    visibility: String,
    unlisted: Boolean
});

module.exports = {
    post_scheme
}
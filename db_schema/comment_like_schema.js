const mongoose = require("mongoose");
const { Schema } = mongoose;
const { author_scheme} = require('./author_schema.js');
const { post_scheme } = require('./post_schema.js');

const comment_scheme = new Schema({
    authorId: Number,
    comment: String,
    contentType: String,
    published: String
})

const comments_scheme = new Schema({
    postId: ObjectID,
    num_of_comments: Number,
    comments: [comment_scheme],
    likes: Number
})

const like_scheme = new Schema({
    authorId: Number,
    postId: Number,
    commentId: Number
})

const likes_scheme = new Schema({
    postId: ObjectID,
    likes: [like_scheme]
})

module.exports = {
    comment_scheme,
    comments_scheme,
    like_scheme,
    likes_scheme
}
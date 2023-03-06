/*
Copyright 2023 Kezziah Camille Ayuno, Alinn Martinez, Tommy Sandanasamy, Allan Ma, Omar Niazie

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.


Furthermore it is derived from the Python documentation examples thus
some of the code is Copyright © 2001-2013 Python Software
Foundation; All Rights Reserved
*/

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

const public_scheme = new Schema({
    _id: {type: String, default: crypto.randomUUID},
    posts: [{
        authorId: String,
        post: post_scheme,
    }],
    num_posts: Number},
    {versionKey: false
})

const PostHistory = database.model('Posts', post_history_scheme);
const Post = database.model('Post', post_scheme);
const Like = database.model('Like', like_scheme);
const Comment = database.model('Comment', comment_scheme);
const PublicPost = database.model('PublicPost', public_scheme);

module.exports = {
    PostHistory,
    Post,
    Like,
    Comment,
    PublicPost
}
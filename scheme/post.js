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

// Database
const mongoose = require("mongoose");
const { Schema } = mongoose;
const database = mongoose.connection;

// Password
const crypto = require('crypto');

const postScheme = new Schema({
    _id: {type: String, default: crypto.randomUUID},
    title: String,
    description: String,
    contentType: String,
    content: String,
    categories: [String],
    count: Number,
    likes: [{ type: String, default: crypto.randomUUID, ref: 'Like' }],
    comments: [{ type: String, default: crypto.randomUUID, ref: 'Comment' }],
    published: String,
    visibility: String,
    specifics: [String],
    unlisted: Boolean,
    image: String},
    {versionKey: false
});

const postHistoryScheme = new Schema({
    _id: {type: String, default: crypto.randomUUID},
    authorId: String,
    num_posts: Number,
    posts: [postScheme]},
    {versionKey: false
})

const publicScheme = new Schema({
    _id: {type: String, default: crypto.randomUUID},
    posts: [{
        authorId: String,
        post: postScheme,
    }],
    num_posts: Number},
    {versionKey: false
})

const inboxScheme = new Schema({
    _id: {type: String, default: crypto.randomUUID},
    authorId: String,
    username: String,
    posts: [postScheme],
    likes: [{ type: String, default: crypto.randomUUID, ref: 'Like' }],
    comments: [{ type: String, default: crypto.randomUUID, ref: 'Comment' }],
    requests: [{ type: String, default: crypto.randomUUID, ref: 'Request' }]},
    {versionKey: false
})

const PostHistory = database.model('Posts', postHistoryScheme);
const Post = database.model('Post', postScheme);
const PublicPost = database.model('PublicPost', publicScheme);
const Inbox = database.model('Inbox', inboxScheme);    

module.exports = {
    PostHistory,
    Post,
    PublicPost,
    Inbox
}
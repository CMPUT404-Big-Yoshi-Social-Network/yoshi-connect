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
const { authorScheme, basicAuthorScheme } = require("./author");
const { likeAuthorScheme} = require("./interactions");
const { Schema } = mongoose;
const database = mongoose.connection;

const postScheme = new Schema({
    _id: String,
    origin: String,
    source: String,
    title: String,
    description: String,
    contentType: String,
    content: String,
    categories: [String],
    count: Number,
    like_count: Number,
    comment_count: Number,
    published: String,
    visibility: String,
    postTo: String,
    unlisted: Boolean,},
    {versionKey: false
});

const postHistoryScheme = new Schema({
    _id: String,
    authorId: String,
    num_posts: Number,
    posts: [postScheme]},
    {versionKey: false
})

const publicScheme = new Schema({
    _id: String,
    posts: [{
        authorId: String,
        post: postScheme,
    }],
    num_posts: Number},
    {versionKey: false
})

const inboxLikeScheme = new Schema({
    author: basicAuthorScheme,
    object: String,
    summary: String
})

const inboxCommentScheme = new Schema({
    _id: String,
    author: basicAuthorScheme,
    comment: String,
    contentType: String,
    published: String,
    object: String
})

const inboxScheme = new Schema({
    _id: String,
    authorId: String,
    username: String,
    posts: [postScheme],
    likes: [inboxLikeScheme],
    comments: [inboxCommentScheme],
    requests: [{ type: String, ref: 'Request' }]},
    {versionKey: false
})


const imageScheme = new Schema({
    _id: String, 
    src: String},
    {versionKey: false
})
const PostHistory = database.model('Post', postHistoryScheme);
const PublicPost = database.model('PublicPost', publicScheme);
const Inbox = database.model('Inbox', inboxScheme); 
const Post = database.model('Post', postScheme);
const Image = database.model("Image", imageScheme)   


module.exports = {
    PostHistory,
    PublicPost,
    Inbox,
    Post, 
    Image
}
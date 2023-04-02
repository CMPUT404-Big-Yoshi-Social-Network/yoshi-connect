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
    likeCount: Number,
    commentCount: Number,
    published: String,
    visibility: String,
    shared: Boolean,
    whoShared: [{
        authorId: String,
        host: String,
        postId: String
    }],
    postFrom: String,
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

const publicPostAuthorsScheme = new Schema({
    _id: String,
    displayName: String,
    profileImage: String,
    pronouns: String
})

const publicScheme = new Schema({
    _id: String, //postId
    author: publicPostAuthorsScheme,
    origin: String,
    source: String,
    title: String,
    description: String,
    contentType: String,
    content: String,
    categories: [String],
    likeCount: Number,
    commentCount: Number,
    published: String,
    visibility: String,
    shared: Boolean,
    postFrom: String,
    unlisted: Boolean,},
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

inboxPostScheme = new Schema({
        _id: String,
        origin: String,
        source: String,
        title: String,
        description: String,
        contentType: String,
        content: String,
        categories: [String],
        author: basicAuthorScheme,
        count: Number,
        likeCount: Number,
        commentCount: Number,
        published: String,
        visibility: String,
        postFrom: String,
        unlisted: Boolean,},
        {versionKey: false
})

const inboxScheme = new Schema({
    _id: String,
    authorId: String,
    username: String,
    posts: [inboxPostScheme],
    likes: [inboxLikeScheme],
    comments: [inboxCommentScheme],
    requests: [{
        _id: String,
        goal: String,
        summary: String,
        actor: String,
        actorId: String,
        objectId: String,
        object: String
    }]},
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
const Image = database.model("Image", imageScheme)   


module.exports = {
    PostHistory,
    PublicPost,
    Inbox,
    Image
}
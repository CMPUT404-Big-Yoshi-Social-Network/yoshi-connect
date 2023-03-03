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

const mongoose = require('mongoose');
const { Schema } = mongoose;

const crypto = require("crypto");

const author_scheme = new Schema({
    _id: { type: String, default: crypto.randomUUID },
    username: String,
    password: String,
    email: String,
    about: String,
    pronouns: String,
    admin: Boolean,},
    {versionKey: false
});

const login_scheme = new Schema({
    authorId: String,
    username: String,
    token: String,
    admin: Boolean,
    expires: String,},
    {versionKey: false
});

const follower_scheme = new Schema({
    username: String,
    followers: [{
        username: String,
    }]},
    {versionKey: false
});

const following_scheme = new Schema({
    username: String,
    followings: [{
        username: String,
    }]},
    {versionKey: false
});

const friend_scheme = new Schema({
    username: String,
    friends: [{
        username: String,
    }]},
    {versionKey: false
});

const request_scheme = new Schema({
    senderId: String,
    receiverId: String,
    status: String},
    {versionKey: false
});

module.exports = {
    author_scheme,
    login_scheme,
    friend_scheme,
    following_scheme,
    follower_scheme,
    request_scheme
}
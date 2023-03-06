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
const database = mongoose.connection;

const crypto = require('crypto');

const author_scheme = new Schema({
    _id: {type: String, default: crypto.randomUUID},
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
    authorId: String,
    followers: [{
        username: String,
        authorId: String
    }]},
    {versionKey: false
});

const following_scheme = new Schema({
    username: String,
    authorId: String,
    followings: [{
        username: String,
        authorId: String
    }]},
    {versionKey: false
});

const friend_scheme = new Schema({
    username: String,
    authorId: String,
    friends: [{
        username: String,
        authorId: String
    }]},
    {versionKey: false
});

const request_scheme = new Schema({
    senderId: String,
    senderUUID: String,
    receiverId: String,
    receiverUUID: String,
    status: String},
    {versionKey: false
});

const Friend = database.model('Friend', friend_scheme);
const Following = database.model('Following', following_scheme);
const Login = database.model('Login', login_scheme);
const Author = database.model('Author', author_scheme);
const Request = database.model('Request', request_scheme);
const Follower = database.model('Follower', follower_scheme);

module.exports = {
    Friend,
    Following,
    Login,
    Author,
    Request,
    Follower
}
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

// Fetch database
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Used for passwords
const crypto = require("crypto");

const authorScheme = new Schema({
    type: 'author',
    _id: {type: String, default: crypto.randomUUID},
    url: String,
    host: String,
    displayName: String,
    github: String,
    profileImage: String},
    {versionKey: false
});

const authorsScheme = new Schema({
    type: 'authors',
    items: [authorScheme],
    _id: {type: String, default: crypto.randomUUID}},
    {versionKey: false
});

const accountScheme = new Schema({
    type: 'account',
    _id: {type: String, default: crypto.randomUUID},
    displayName: String,
    password: String,
    email: String,
    about: String,
    pronouns: String,
    admin: Boolean},
    {versionKey: false
});

const loginScheme = new Schema({
    type: 'login',
    _id: {type: String, default: crypto.randomUUID},
    authorId: String,
    token: String,
    expires: String,
    admin: Boolean},
    {versionKey: false
});

const followerScheme = new Schema({
    type: 'followers',
    _id: {type: String, default: crypto.randomUUID},
    authorId: String,
    items: [authorScheme]},
    {versionKey: false
});

const followingScheme = new Schema({
    type: 'followings',
    _id: {type: String, default: crypto.randomUUID},
    authorId: String,
    items: [author_scheme]},
    {versionKey: false
});

const friendScheme = new Schema({
    type: 'friends',
    _id: {type: String, default: crypto.randomUUID},
    authorId: String,
    items: [author_scheme]},
    {versionKey: false
});

const requestScheme = new Schema({
    type: String,
    _id: {type: String, default: crypto.randomUUID},
    summary: String,
    actor: author_scheme,
    object: author_scheme},
    {versionKey: false
});

const Friend = database.model('Friend', friendScheme);
const Following = database.model('Following', followingScheme);
const Login = database.model('Login', loginScheme);
const Author = database.model('Author', authorScheme);
const Request = database.model('Request', requestScheme);
const Follower = database.model('Follower', followerScheme);
const Account = database.model('Account', accountScheme);
const Authors = database.model('Authors', authorsScheme);

module.exports = {
    Friend,
    Following,
    Login,
    Author,
    Request,
    Follower,
    Account,
    Authors
}
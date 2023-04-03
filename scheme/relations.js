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
const mongoose = require('mongoose');
const { Schema } = mongoose;
const database = mongoose.connection;

const followerScheme = new Schema({
    _id: String,
    username: String,
    authorId: String,
    followers: [{
        _id: String,
        id: String,
        authorId: String,
        displayName: String,
        github: String,
        profileImage: String
    }]},
    {versionKey: false
});

const followingScheme = new Schema({
    _id: String,
    username: String,
    authorId: String,
    followings: [{
        _id: String,
        id: String,
        authorId: String,
        displayName: String,
        github: String,
        profileImage: String
    }]},
    {versionKey: false
});

const requestScheme = new Schema({
    _id: String,
    goal: String,
    actor: {
        id: String,
        host: String,
        displayName: String,
        url: String,
        github: String,
        profileImage: String
    }, 
    object: {
        id: String,
        host: String,
        displayName: String,
        url: String,
        github: String,
        profileImage: String
    }},
    {versionKey: false
});

//const Friend = database.model('Friend', friendScheme);
const Following = database.model('Following', followingScheme);
const Request = database.model('Request', requestScheme);
const Follower = database.model('Follower', followerScheme);

module.exports = {
    Following,
    Request,
    Follower
}
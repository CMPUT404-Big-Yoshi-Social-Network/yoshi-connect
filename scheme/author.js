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

// Password
const crypto = require('crypto');

const authorScheme = new Schema({
    _id: {type: String, default: crypto.randomUUID},
    username: String,
    password: String,
    email: String,
    about: String,
    pronouns: String,
    admin: Boolean,},
    {versionKey: false
});

const loginScheme = new Schema({
    _id: {type: String, default: crypto.randomUUID},
    authorId: String,
    username: String,
    token: String,
    admin: Boolean,
    expires: String,},
    {versionKey: false
});

const Login = database.model('Login', loginScheme);
const Author = database.model('Author', authorScheme);

module.exports = {
    Login,
    Author
}
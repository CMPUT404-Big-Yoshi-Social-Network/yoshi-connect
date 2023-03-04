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

// Used for passwords
const crypto_js = require('crypto-js');

// Used for tokens
const UIDGenerator = require('uid-generator')
const uidgen = new UIDGenerator();

// Fetching database
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;

// Schemas
const { authorScheme, loginScheme } = require('../db_schema/authorSchema.js');
const Author = database.model('Author', authorScheme);
const Login = database.model('Login', loginScheme);

async function registerAuthor(req, res){
    await Author.findOne({username: req.body.username}, function(err, author) {
        if (author) {
            console.log("Debug: Author does exist, authentication failed.");
            return res.json({
                status: false
            });
        } else {
            console.log("Debug: Author does not exist yet.")
        }
    }).clone()

    const authorId = (await Author.find().sort({authorId:-1}).limit(1))[0].authorId + 1;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    if(!username || !email || !password){
        console.log("Debug: Did not fill in all the cells.")
        return res.json({
            status: false
        });
    }

    var author = new Author({
        username: username,
        password: crypto_js.SHA256(password),
        email: email,
        about: "...",
        pronouns: ".../...",
        admin: false
    });

    author.save(async (err, author, next) => {
        if (err) {
            return res.json({
                status: false
            });
        }
        console.log("Debug: " + author.username + " added successfully to database.");
        
        let curr = new Date();
        let expiresAt = new Date(curr.getTime() + (1440 * 60 * 1000));
        let token = uidgen.generateSync();

        let login = new Login({
            authorId: author._id,
            username: username,
            token: token,
            admin: false,
            expires: expiresAt
        });

        login.save((err, login) => {
            if (err) {
                return res.json({
                    status: false
                });
            }
            console.log("Debug: Login cached.")
            res.setHeader('Set-Cookie', 'token=' + token + '; SameSite=Strict' + '; HttpOnly' + '; Secure')
            return res.json({
                status: true
            });
        })
    });
}

async function getProfile(req, res) {
    console.log('Debug: Fetching the profile to view.')
    if (req.cookies == undefined) {
        return res.sendStatus(404);
    }
    else if (req.cookies["token"] == undefined) {
        return res.sendStatus(404);
    }

    const login = await Login.findOne({token: req.cookies["token"]});
    if (login == undefined) {
        return res.sendStatus(404);
    }

    const author = await Author.findOne({username: req.path.split("/")[req.path.split("/").length - 1]})
    if (!author) {
        return res.sendStatus(404);
    } else if (author.username == login.username) {
        console.log("Debug: This is your personal account.")
        return res.json({
            viewed: author.username,
            viewer: login.username,
            personal: true
        });
    } else if (author.username != login.username) {
        console.log("Debug: This is not your personal account.")
        return res.json({
            viewed: author.username,
            viewer: login.username,
            personal: false
        });
    }
}

module.exports={
    registerAuthor,
    getProfile
}
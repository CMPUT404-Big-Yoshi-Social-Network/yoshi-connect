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
<<<<<<< HEAD
const { Author, Login, Account, Authors } = require('../db_schema/author_schema.js');
const { checkDisplayName } = require('../auth.js');
=======

// Database
>>>>>>> 6d7c871075b154999bfe348ef95b8f823b363baf
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

// Additional functions
const { checkDisplayName } = require('../auth.js');

// Schemas
const { Author, Login, Account } = require('../db_schema/author_schema.js');
const { createFollowers, createFollowings, createFriends } = require('./relations.js');

async function registerAuthor(req, res){
    if(await checkDisplayName(req) === "In use") { return res.sendStatus(400); }
    console.log("Debug: Author does not exist yet.");

    let authors = await Authors.find().clone();
    if (authors === undefined || authors === null) {
        authors = new Authors({
            type: 'authors',
            items: []
        });  
        await authors.save();      
    }

    const displayName = req.body.displayName;
    const email = req.body.email;
    const password = req.body.password;
    if( !username || !email || !password ){ return res.sendStatus(400); }

    var account = new Account({
        type: 'account',
        displayName: displayName,
        password: crypto_js.SHA256(password),
        email: email,
        about: "",
        pronouns: "",
        admin: false
    });
    await account.save();

    var author = new Author({
        type: 'author',
        displayName: displayName,
        url: '',
        host: '',
        github: '',
        profileImage: ''
    });
    await author.save();

    authors.items.push(author);
    authors.save();

    console.log("Debug: " + author.displayName + " added successfully to database");
        
    let curr = new Date();
    let expiresAt = new Date(curr.getTime() + (1440 * 60 * 1000));
    let token = uidgen.generateSync();

    let login = new Login({
        type: 'login',
        authorId: author._id,
        token: token,
        expires: expiresAt,
        admin: account.admin
    });

    login.save((err, login) => {
        if (err) { return; }
        console.log("Debug: Login Cached.")
        res.setHeader('Set-Cookie', 'token=' + token + '; SameSite=Strict' + '; HttpOnly' + '; Secure')
        return res.json({ status: "Successful" });
    })

    author.save(async (err, author, next) => { if (err) { return res.sendStatus(400); } });
    account.save(async (err, account, next) => { if (err) { return res.sendStatus(400); } });

    await createPostHistory(author._id);
    await createFollowers(author._id);
    await createFriends(author._id);
    await createFollowings(author._id);
}

async function getProfile(req, res) {
    if (req.cookies == undefined || req.cookies["token"] == undefined) { return res.sendStatus(404); } 

    const login = await Login.findOne({token: req.cookies["token"]});
    if (login == undefined) { return res.sendStatus(404); }

    const author = await Author.findOne({displayName: req.path.split("/")[req.path.split("/").length - 1]})
    if (!author) { 
        return res.sendStatus(404); 
    } else if (author.displayName == login.displayName) {
        console.log("Debug: This is your personal account.")
        return res.json({
            viewed: author.displayName,
            viewer: login.displayName,
            personal: true
        });
    } else if (author.displayName != login.displayName) {
        console.log("Debug: This is not your personal account.")
        return res.json({
            viewed: author.displayName,
            viewer: login.displayName,
            personal: false
        });
    }
}

async function getCurrentAuthor(req, res){
    await Login.findOne({token: req.body.data.sessionId}, function(err, login) {
        console.log('Debug: Retrieving current author logged in')
        if (!login) { return res.sendStatus(404); }
        return res.json({ authorId: login.authorId });
    }).clone();
}

async function getCurrentAuthorDisplayName(req, res){
    await Login.findOne({token: req.body.data.sessionId}, function(err, login) {
        console.log('Debug: Retrieving current author logged in')
        if(!login){ return res.sendStatus(404); }
        return res.json({ displayName: login.displayName })
    }).clone();
}

module.exports={
    registerAuthor,
    getProfile,
    getCurrentAuthor,
    getCurrentAuthorDisplayName
}
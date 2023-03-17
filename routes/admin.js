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

// Password
const crypto_js = require('crypto-js');

// UUID
const crypto = require('crypto');

// Database
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

// Schemas
const { Login, Author } = require('../scheme/author.js');

async function addAuthor(req, res){
    let existingAuthor = await Author.findOne({username: req.body.data.username}).clone();
    if (existingAuthor !== undefined && existingAuthor !== null) { return res.sendStatus(400); }

    const username = req.body.data.username;
    const email = req.body.data.email;
    const password = req.body.data.password;
    let uuid = String(crypto.randomUUID).replace(/-/g, "");

    if (!username && !email && !password) { return res.sendStatus(400); }

    let author = new Author({
        _id: uuid,
        username: username,
        password: crypto_js.SHA256(password),
        email: email,
        about: "",
        pronouns: "",
        github: "",
        profileImage: "",
        admin: false,
    });

    author.save((err) => {
        if(err){ return res.sendStatus(500); }
        return res.sendStatus(200);
    });
}

async function modifyAuthor(req, res){
    const author = await Author.findOne({_id: req.body.data.authorId}).clone();

    if (author == undefined) { return res.sendStatus(404); }

    if (author.username != req.body.data.newUsername) {
        let existingAuthor = await Author.findOne({username: req.body.data.newUsername});
        if (existingAuthor) { return res.sendStatus(400); }
    }

    if (author.email != req.body.data.newEmail) {
        let existingAuthor = await Author.findOne({email: req.body.data.newEmail});
        if (existingAuthor) { return res.sendStatus(400); }
    }

    author.username = req.body.data.newUsername;
    author.password = crypto_js.SHA256(req.body.data.newPassword);
    author.email = req.body.data.newEmail;
    author.about = req.body.data.newAbout;
    author.pronouns = req.body.data.newPronouns;
    author.admin = req.body.data.newAdmin;
    author.save();

    await Login.find({username: req.body.data.username}, function(err, logins){
        if (err) { res.sendStatus(500); }
        for(let i = 0; i < logins.length; i++){
            logins[i].admin = req.body.data.newAdmin;
            logins[i].save();
        }
        return res.sendStatus(200);
    }).clone();
}

async function deleteAuthor(req, res){
    await Author.deleteOne({_id: req.body.author.id}, function(err, obj){
        if (!obj.acknowledged) { return res.sendStatus(404); }

        Login.deleteMany({authorId: req.body.author.id}, function(err, obj) { 
            if (err) throw res.sendStatus(500);
            return res.sendStatus(200)
        }).clone();
    }).clone();
}

module.exports={
    addAuthor,
    modifyAuthor,
    deleteAuthor
}
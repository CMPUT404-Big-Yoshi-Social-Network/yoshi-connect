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
    let existingAuthor = await Author.findOne({username: req.body.username}).clone();
    if (existingAuthor !== undefined && existingAuthor !== null) { return res.sendStatus(400); }

    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    let uuid = String(crypto.randomUUID()).replace(/-/g, "");

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
        if (err) { return res.sendStatus(500); }
        return res.json({
            "type": "author",
            "id" : process.env.DOMAIN_NAME + "authors/" + uuid,
            "authorId" : uuid,
            "host": process.env.DOMAIN_NAME,
            "url": process.env.DOMAIN_NAME + "authors/" + uuid,
            "displayname": username,
            "email": email,
            "about": "",
            "pronouns": "",
            "github": "",
            "profileImage": "",
            admin: false
        });
    });
}

async function modifyAuthor(req, res){
    const author = await Author.findOne({_id: req.body.authorId}).clone();

    if (author == undefined) { return res.sendStatus(404); }

    if (author.username != req.body.newUsername) {
        let existingAuthor = await Author.findOne({username: req.body.newUsername});
        if (existingAuthor) { return res.sendStatus(400); }
    }

    if (author.email != req.body.newEmail) {
        let existingAuthor = await Author.findOne({email: req.body.newEmail});
        if (existingAuthor) { return res.sendStatus(400); }
    }

    author.username = req.body.newUsername;
    author.password = crypto_js.SHA256(req.body.newPassword);
    author.email = req.body.newEmail;
    author.about = req.body.newAbout;
    author.pronouns = req.body.newPronouns;
    author.admin = req.body.newAdmin;
    author.save();

    await Login.find({username: req.body.username}, function(err, logins){
        if (err) { res.sendStatus(500); }
        for(let i = 0; i < logins.length; i++){
            logins[i].admin = req.body.newAdmin;
            logins[i].save();
        }
        return res.json({
            "type": "author",
            "id" : process.env.DOMAIN_NAME + "authors/" + author._id,
            "authorId" : author._id,
            "host": process.env.DOMAIN_NAME,
            "url": process.env.DOMAIN_NAME + "authors/" + author._id,
            "displayname": req.body.newUsername,
            "email": req.body.newEmail,
            "about": req.body.newAbout,
            "pronouns": req.body.newPronouns,
            "admin": req.body.newAdmin
        })
    }).clone();
}

async function deleteAuthor(req, res){
    await Author.deleteOne({_id: req.body.author.id}, function(err, obj){
        if (!obj.acknowledged) { return res.sendStatus(404); }

        Login.deleteMany({authorId: req.body.author.id}, function(err, obj) { 
            if (err) throw res.sendStatus(500);
            return res.sendStatus(204);
        }).clone();
    }).clone();
}

module.exports={
    addAuthor,
    modifyAuthor,
    deleteAuthor
}
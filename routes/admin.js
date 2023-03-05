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

const crypto_js = require('crypto-js');
const { Account, Login, Author } = require('../db_schema/authorSchema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;

async function addAuthor(req, res){
    console.log('Debug: Adding a new author.');

    let existingAccount = await Account.findOne({authorId: req.body.data.authorId}).clone();
    let existingAuthor = await Author.findOne({_id: req.body.data.authorId}).clone();

    if ((existingAuthor === undefined || existingAuthor === null) && (existingAccount === undefined || existingAccount === null)) { 
        return res.sendStatus(400); 
    }

    const displayName = req.body.data.displayName;
    const email = req.body.data.email;
    const password = req.body.data.password;

    let account = new Account({
        type: 'account',
        displayName: displayName,
        password: crypto_js.SHA256(password),
        email: email,
        about: "",
        pronouns: "",
        admin: req.body.data.admin
    });

    let author = new Author({
        type: 'author',
        url: '',
        host: '',
        displayName: displayName,
        github: '',
        profileImage: ''
    });

    account.save((err) => {
        if(err){ return res.sendStatus(500); }
        return res.sendStatus(200);
    });
    author.save((err) => {
        if(err){ return res.sendStatus(500); }
        return res.sendStatus(200);
    });

    console.log("Debug: " + author.displayName + " added successfully to database.");

}

async function modifyAuthor(req, res){

    const account = await Account.findOne({authorId: req.body.data.authorId}).clone();
    if(account == undefined){ 
        console.log('Debug: Could not find author.')
        return res.sendStatus(404); 
    }

    if (account.authorId != req.body.data.authorId) {
        console.log('Debug: Checking if username is taken.')
        existing_author = await Account.findOne({displayName: req.body.data.newDisplayName});
        if (existing_author) { return res.sendStatus(400); }
    }

    console.log('Debug: Found the author.');
    account.displayName = req.body.data.newDisplayName;
    account.password = crypto_js.SHA256(req.body.data.newPassword);
    account.email = req.body.data.newEmail;
    account.about = req.body.data.newAbout;
    account.pronouns = req.body.data.newPronouns;
    account.admin = req.body.data.newAdmin;
    account.save();

    const author = await Author.findOne({_id: req.body.data.authorId}).clone();
    author.displayName = req.body.data.newDisplayName;
    author.save();

    await Login.find({authorId: req.body.data.authorId}, function(err, logins){
        if (err) { res.sendStatus(500); }
        for(let i = 0; i < logins.length; i++){
            logins[i].admin = req.body.data.newAdmin;
            logins[i].save();
        }
        return res.sendStatus(200);
    }).clone();
}

async function deleteAuthor(req, res){
    console.log('Debug: Attempt to delete an author.')
    await Author.deleteOne({_id: req.body.authorId}, function(err, obj){
        if (obj.deletedCount == 0) { return res.sendStatus(404); }

        Login.deleteMany({_id: req.body.authorId}, function(err, obj) { return res.sendStatus(200) }).clone();
    }).clone();

    await Account.deleteOne({authorId: req.body.authorId}, function(err, obj){
        if (obj.deletedCount == 0) { return res.sendStatus(404); }
    }).clone();
}

module.exports={
    addAuthor,
    modifyAuthor,
    deleteAuthor
}
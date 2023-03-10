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

// Database
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

// Schemas
const { Login, Author } = require('../scheme/author.js');

async function addAuthor(req, res){
    /**
     * Description: Adds an author to the database 
     * Returns: Status 200 if the author is successfully saved into the database
     *          Status 500 if the author is unsuccessfully saved into the database (Server Error)
     */
    console.log('Debug: Adding a new author.');

    let existingAuthor = await Author.findOne({username: req.body.data.username}).clone();
    if (existingAuthor !== undefined && existingAuthor !== null) { 
        console.log('Debug: Author exists')
        return res.sendStatus(400); 
    }

    const username = req.body.data.username;
    const email = req.body.data.email;
    const password = req.body.data.password;

    let author = new Author({
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

    console.log("Debug: " + author.username + " added successfully to database.");
}

async function modifyAuthor(req, res){
    /**
     * Description: Modifies an existing author in the database 
     * Returns: Status 404 if the author could not be found 
     *          Status 400 if the admin inputs a displayName or email is already taken 
     *          Status 500 if there is an error finding a current login (token)
     *          Status 200 if the author is successfully 
     */
    const author = await Author.findOne({_id: req.body.data.authorId}).clone();

    if(author == undefined){ 
        console.log('Debug: Could not find author.')
        return res.sendStatus(404); 
    }

    if (author.username != req.body.data.newUsername) {
        console.log('Debug: Checking if username is taken.')
        existing_author = await Author.findOne({username: req.body.data.newUsername});
        if (existing_author) { return res.sendStatus(400); }
    }

    if (author.email != req.body.data.newEmail) {
        console.log('Debug: Checking if username is taken.')
        existing_author = await Author.findOne({email: req.body.data.newEmail});
        if (existing_author) { return res.sendStatus(400); }
    }

    console.log('Debug: Found the author.');
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
    /**
     * Description: Deletes an existing author 
     * Returns: Status 404 if the author could not be found 
     *          Status 200 after the login (token) for the author is deleted along with their author account 
     */
    console.log('Debug: Attempt to delete an author.')
    await Author.deleteOne({username: req.body.username}, function(err, obj){
        console.log('Debug: Delete count for deleting an author ' + obj)
        if (obj.deletedCount == 0) { return res.sendStatus(404); }

        Login.deleteMany({username: req.body.username}, function(err, obj) { return res.sendStatus(200) }).clone();
    }).clone();
}

module.exports={
    addAuthor,
    modifyAuthor,
    deleteAuthor
}
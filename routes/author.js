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

// UUID Identification Generator
const UIDGenerator = require('uid-generator')
const uidgen = new UIDGenerator();

// Database
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

// Schemas
const { Author, Login } = require('../scheme/author.js');
const { Follower, Following } = require('../scheme/relations.js');
const { PostHistory } = require('../scheme/post.js');


// Additional Functions
const { createInbox } = require('./inbox.js')

// Additional Functions
const { checkUsername, checkExpiry } = require('./auth.js');

async function registerAuthor(req, res){
    /**
     * Description: Registers an author into the database (from Signup). A login document is created to represent the token that 
     *              keeps the author logged into their device. This token expires in 24 hours (curr.getTime() + (1440 * 60 * 1000)).
     *              It also creates the new author's post history, friends, following, and follower documents
     * Returns: Status 400 if:
     *             - The displayName that the author wanted to use is already in use 
     *             - The user did not fill all the cells for displayName, password, and email
     *             - The email the author wanted to use is already taken 
     *          Status 500 if the login (token) or author could not be saved into the database 
     */
    if(await checkUsername(req) === "In use") { 
        console.log('Debug: Username in use.')
        return res.sendStatus(400); 
    }
    console.log("Debug: Author does not exist yet.");

    const username = req.body.data.username;
    const email = req.body.data.email;
    const password = req.body.data.password;
    const checkEmail = await Author.findOne({email: email})

    if ( !username || !email || !password ) { 
        console.log('Debug: Not all cells are filled.')
        return res.sendStatus(400); 
    }
    if (checkEmail !== undefined && checkEmail !== null) { 
        console.log('Debug: The email is taken.')
        return res.sendStatus(400); 
    }

    var author = new Author({
        username: username,
        password: crypto_js.SHA256(password),
        email: email,
        about: "",
        pronouns: "",
        github: "",
        profileImage: "",
        admin: false
    });

    author.save(async (err, author, next) => { if (err) { return res.sendStatus(500); } });
    console.log("Debug: " + author.username + " added successfully to database");
        
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
        if (err) { res.sendStatus(500); }
        console.log("Debug: Login cached.")
        
    })

    let new_post_history = new PostHistory ({
        authorId: author._id,
        num_posts: 0,
        posts: []
    })

    new_post_history.save((err) => {
        if(err){ return res.sendStatus(500); }
    });

    await Follower({ username: username, authorId: author._id, followers: [] }).save();
    await Following({ username: username, authorId: author._id, followings: [] }).save();
    await createInbox(author.username, author._id);

    res.setHeader('Set-Cookie', 'token=' + token + '; SameSite=Strict' + '; HttpOnly' + '; Secure')
    return res.sendStatus(200);
}

async function getProfile(req, res) {
    /**
     * Description: Gets an author's profile (either their personal or someone else's). 
     * Returns: Status 404 if:
     *              - The viewer is currently not logged in (i.e., no cookies, token, or login document)
     *              - The profile does not exist 
     *          If successful, it returns the viewed author (profile owner), viewer (viewing the profile), 
     *          and indicator for if the viewer author is looking at their own account
     */
    if (req.cookies == undefined) { return res.sendStatus(404); } else if (req.cookies.token == undefined) { return res.sendStatus(404); }

    const login = await Login.findOne({token: req.cookies.token});
    if (login == undefined) { return res.sendStatus(404); }

    const username = req.params.username;
    const author = await Author.findOne({username: username})
    if (!author) { 
        return res.sendStatus(404); 
    } else if (author.username == login.username) {
        console.log("Debug: This is your personal account.")
        return res.json({
            viewed: author.username,
            viewedId: author._id,
            viewer: login.username,
            viewerId: login.authorId,
            personal: true
        });
    } else if(author.username != login.username) {
        console.log("Debug: This is not your personal account.")
        return res.json({
            viewed: author.username,
            viewedId: author._id,
            viewer: login.username,
            viewerId: login.authorId,
            personal: false
        });
    }
}

async function getCurrentAuthorUsername(req, res){
        /**
     * Description: Retrieves the current author's displayName 
     * Returns: Status 404 if there is no login document for the token stored in cookies 
     *          If successful, the displayName is sent to client 
     */
    const login = await Login.findOne({token: req.cookies.token})
    if (!login) { return res.sendStatus(404); }
    return res.json({ username: login.username })
}

async function getCurrentAuthorAccountDetails(req, res) {
    /**
     * Description: Retrieves the current author's account details such as their displayName and Email
     * Returns: Status 404 if the login document does not exist or if the author does not exist
     */
    const login = await Login.findOne({token: req.cookies.token})
    if (!login) { return res.sendStatus(404); }
    const author = await Author.findOne({_id: login.authorId})
    if (!author) { return res.sendStatus(404); }
    return res.json({ username: author.username, email: author.email })
}

async function updateAuthor(req, res){
    /**
     * Description: Provides the author the ability to update their profile (i.e., username, password, email)
     * Returns: Status 404 if the login document or author does not exist 
     *          Status 400 if the author tried to use a taken email or username 
     */
    const login = await Login.findOne({token: req.cookies.token})
    if (!login) { return res.sendStatus(404); }
    const author = await Author.findOne({_id: login.authorId}).clone();
    if (!author) { return res.sendStatus(404); }

    if (author.username != req.body.data.newUsername) {
        console.log('Debug: Checking if username is taken.')
        existing_author = await Author.findOne({username: req.body.data.newUsername});
        if (existing_author) { return res.sendStatus(400); }
    }

    if (author.email != req.body.data.newEmail) {
        console.log('Debug: Checking if email is taken.')
        existing_author = await Author.findOne({email: req.body.data.newEmail});
        if (existing_author) { return res.sendStatus(400); }
    }

    author.username = req.body.data.newUsername;
    author.password = crypto_js.SHA256(req.body.data.newPassword);
    author.email = req.body.data.newEmail;
    author.save();
}

/** 
 * API STUFF keep seperate from other things for now
*/

async function getAuthor(authorId){
    /**
     * Description: Gets the author from the Author collection 
     * Returns: Status 500 if the server fails to get an author from the collection 
     *          Status 404 if the author does not exist
     */
    const author = await Author.findOne({_id: authorId}, function (err, author) {
        if (err) { return "server failure"; }
        return [author, 200];
    }).clone();
    if(author == "server failure") {
        return [{}, 500];
    } else if (!author) {
        return [{}, 404];
    }

    const sanitizedAuthor = {
        "type": "author",
        "id" : author._id,
        "host": process.env.DOMAIN_NAME,
        "displayname": author.username,
        "url":  process.env.DOMAIN_NAME + "authors/" + author._id,
        "github": "",
        "profileImage": "",
        "email": author.email, 
        "about": author.about,
        "pronouns": author.pronouns,
    }
    return [sanitizedAuthor, 200];
}

async function apiUpdateAuthor(token, author){
    /**
     * Description: Updates an existing author in the database
     * Returns: Status 401 if the there is no valid authentication 
     *          Status 200 if the author was successfully updated
     */
    if (await checkExpiry(token)) { return 401; }

    let authorProfile = await Author.findOne({_id: author.id});
    if(!authorProfile) return 404;

    if (author.pronouns != undefined) {
        authorProfile.pronouns = author.pronouns;
    }
    if (author.email != undefined) {
        authorProfile.email = author.email;
    }
    if (author.about != undefined) {
        authorProfile.about = author.about;
    }
    if (author.github != undefined) {
        authorProfile.github = author.github;
    }
    if (author.password != undefined) {
        authorProfile.password = crypto_js.SHA256(author.password);
    }
    if (author.admin != undefined) {
        authorProfile.admin = author.admin; 
    }
    await authorProfile.save();

    return 200;
}

async function getAuthors(page, size){
    let authors = undefined;
    if(page > 1){
        authors = await Author.find().skip((page-1) * size).limit(size);
    }
    else if (page == 1){
        authors = await Author.find().limit(size);
    }
    else{
        return [[], 400];
    }

    if (!authors) {
        return [[], 500];
    }
    
    let sanitizedAuthors = [];

    for(let i = 0; i < authors.length; i++){
        const author = authors[i];
        //TODO ADD github and prfile image
        sanitizedAuthors.push({
                "type": "author",
                "id" : author._id,
                "host": process.env.DOMAIN_NAME,
                "displayname": author.username,
                "url":  process.env.DOMAIN_NAME + "users/" + author._id,
                "github": "",
                "profileImage": "",
                "email": author.email, 
                "about": author.about,
                "pronouns": author.pronouns
        })
    }
    return [sanitizedAuthors, 200];
}

async function getCurrentAuthor(req, res){
    /**
     * Description: Retrieves the current author's authorId 
     * Returns: Status 404 if there is no login document for the token stored in cookies 
     *          If successful, the authorId is sent to client 
     */
    const login = await Login.findOne({token: req.cookies.token})
    if (!login) { return res.sendStatus(404); }
    const author = await Author.findOne({_id: login.authorId })
    if (!author) { return res.sendStatus(404); }
    return res.json({ author: author })
}

module.exports={
    registerAuthor,
    getProfile,
    getCurrentAuthor,
    getCurrentAuthorUsername,
    getCurrentAuthorAccountDetails,
    updateAuthor,
    getAuthor,
    apiUpdateAuthor,
    getAuthors
}
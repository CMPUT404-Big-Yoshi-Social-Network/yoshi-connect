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

// UUID Identification Generator
const UIDGenerator = require('uid-generator')
const uidgen = new UIDGenerator();

// Database
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

// Schemas
const { Author, Login } = require('../scheme/author.js');
const { Follower, Following } = require('../scheme/relations.js');
const { PostHistory, Inbox } = require('../scheme/post.js');


// Additional Functions
const { checkUsername, checkExpiry } = require('./auth.js');
const { Liked, LikedHistory } = require('../scheme/interactions.js');

async function createInbox(username, authorId){
    let uuid = String(crypto.randomUUID()).replace(/-/g, "");
    await Inbox({
        _id: uuid,
        authorId: authorId,
        username: username,
        posts: [],
        likes:[],
        comments: [],
        requests: []
    }).save();
}

async function registerAuthor(req, res){
    if (await checkUsername(req) === "In use") { return res.sendStatus(400); }

    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const checkEmail = await Author.findOne({email: email})
    let uuid = String(crypto.randomUUID()).replace(/-/g, "");

    if ( !username || !email || !password ) { return res.sendStatus(400); }
    if (checkEmail !== undefined && checkEmail !== null) { return res.sendStatus(400); }

    var author = new Author({
        _id: uuid,
        username: username,
        password: crypto_js.SHA256(password),
        email: email,
        about: "",
        pronouns: "",
        github: "",
        profileImage: "",
        admin: false,
        allowed: false
    });

    author.save(async (err, author, next) => { if (err) { return res.sendStatus(500); } });

    let uuidPH = String(crypto.randomUUID()).replace(/-/g, "");
    let new_post_history = new PostHistory ({
        _id: uuidPH,
        authorId: author._id,
        num_posts: 0,
        posts: []
    })

    new_post_history.save((err) => { if (err) { return res.sendStatus(500); } });

    let uuidFollower = String(crypto.randomUUID()).replace(/-/g, "");
    let uuidFollowing = String(crypto.randomUUID()).replace(/-/g, "");
    let uuidLikedHistory = String(crypto.randomUUID()).replace(/-/g, "");
    await Follower({ _id: uuidFollower, username: username, authorId: author._id, followers: [] }).save();
    await Following({ _id: uuidFollowing, username: username, authorId: author._id, followings: [] }).save();
    await createInbox(author.username, author._id);
    await LikedHistory({_id: uuidLikedHistory, authorId: uuid, numObjects: 0, liked: []}).save();

    return res.sendStatus(200);
}

async function getProfile(req, res) {
    if (req.cookies == undefined) { return res.sendStatus(404); } else if (req.cookies.token == undefined) { return res.sendStatus(404); }

    const login = await Login.findOne({token: req.cookies.token});
    if (login == undefined) { return res.sendStatus(404); }

    const username = req.params.username;
    const author = await Author.findOne({username: username})
    if (!author) { 
        return res.sendStatus(404); 
    } else if (author.username == login.username) {
        return res.json({
            viewed: author.username,
            viewedId: author._id,
            viewer: login.username,
            viewerId: login.authorId,
            personal: true
        });
    } else if(author.username != login.username) {
        return res.json({
            viewed: author.username,
            viewedId: author._id,
            viewer: login.username,
            viewerId: login.authorId,
            personal: false
        });
    }
}

async function getAuthor(authorId){
    const author = await Author.findOne({_id: authorId}, function (err, author) {
        if (err) { return "server failure"; }
        return [author, 200];
    }).clone();

    if (author == "server failure") { 
        return [{}, 500];
    } else if (!author) { 
        return [{}, 404]; 
    }

    const sanitizedAuthor = {
        "type": "author",
        "id" : process.env.DOMAIN_NAME + "authors/" + author._id,
        "authorId" : author._id,
        "host": process.env.DOMAIN_NAME,
        "displayName": author.username,
        "url":  process.env.DOMAIN_NAME + "authors/" + author._id,
        "github": author.github,
        "profileImage": author.profileImage,
        "about": author.about,
        "pronouns": author.pronouns
    }
    return [sanitizedAuthor, 200];
}

async function updateAuthor(token, author){
    if (await checkExpiry(token)) { return [null, 401]; }

    let authorProfile = await Author.findOne({_id: author.id});
    if(!authorProfile) return [null, 404];

    if (author.pronouns != undefined) { authorProfile.pronouns = author.pronouns; }
    if (author.email != undefined) { authorProfile.email = author.email; }
    if (author.about != undefined) { authorProfile.about = author.about; }
    if (author.github != undefined) { authorProfile.github = author.github; }
    if (author.password != undefined) { authorProfile.password = crypto_js.SHA256(author.password); }
    if (author.admin != undefined) { authorProfile.admin = author.admin; }

    await authorProfile.save();

    sanitizedAuthor = {
        "type": 'author',
        "id" : process.env.DOMAIN_NAME + "authors/" + authorProfile._id,
        "authorId" : authorProfile._id,
        "host": process.env.DOMAIN_NAME,
        "displayName": authorProfile.username,
        "url":  process.env.DOMAIN_NAME + "authors/" + authorProfile._id,
        "github": authorProfile.github,
        "profileImage": authorProfile.profileImage,
        "email": authorProfile.email, 
        "about": authorProfile.about,
        "pronouns": authorProfile.pronouns
    }

    return [sanitizedAuthor, 200];
}

async function getAuthors(page, size){
    let authors = undefined;

    if (page > 1) { 
        authors = await Author.find().skip((page-1) * size).limit(size); 
    } else if (page == 1) {
        authors = await Author.find().limit(size);
    } else {
        return [[], 400];
    }

    if (!authors) { return [[], 500]; }
    
    let sanitizedAuthors = [];

    for(let i = 0; i < authors.length; i++){
        const author = authors[i];
        sanitizedAuthors.push({
                "type": "author",
                "id" : process.env.DOMAIN_NAME + "authors/" + author._id,
                "host": process.env.DOMAIN_NAME,
                "displayName": author.username,
                "url":  process.env.DOMAIN_NAME + "authors/" + author._id,
                "github": "",
                "profileImage": "",
                "email": author.email, 
                "about": author.about,
                "pronouns": author.pronouns
        })
    }
    return [sanitizedAuthors, 200];
}

function validateAuthorObject(author){
    if(!author || !author.id || !author.host || !author.displayName || !author.url || !author.github || !author.profileImage){
        return false;
    }

    return true;
}

module.exports={
    registerAuthor,
    getProfile,
    getAuthor,
    updateAuthor,
    getAuthors,
    validateAuthorObject
}
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
const crypto_js = require('crypto-js')

// UUID Identification Generator 
const UIDGenerator = require('uid-generator')
const uidgen = new UIDGenerator();

// UUID
const crypto = require('crypto');

// Database
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

// Schemas
const { Author, Login } = require('../scheme/author.js');

async function checkUsername(req) {
    /**
    Description: Authenticates username
    Associated Endpoint: /authors/:authorid
    Request Type: GET
    Request Body: Example: 
                    { username: abc }
    Return: N/A
    */
    const author = await Author.findOne({username: req.body.username});

    if (author == undefined) { return "Not in use"; }

    if (author.username == req.body.username) {
        console.log("Debug: Username is taken, Authentication failed");
        return "In use";
    }

    return "Not in use";
}

async function removeLogin(req, res) {
    /**
    Description: Deletes the Author's login token
    Associated Endpoint: /settings/logout:
    Request Type: DELETE
    Request Body: N/A
    Return: 500 Status (Internal Server Error) -- Unable to delete login token from database
            200 Status (OK) -- Login document (associated token) succesfully removed
            401 Status (Unauthorized) -- Token is not authenticated
    */
    if (req.cookies.token != undefined) {

        Login.deleteOne({token: req.cookies.token}, function(err, login) {
            if (err) throw res.sendStatus(500);
            return res.sendStatus(200)
        })
    } else {
        return res.sendStatus(401)
    }
}

async function checkExpiry(token) {
    /**
    Description: Checks token authentication
    Associated Endpoint: /admin/dashboard:
                         /authors/:authorId/followers:
                         /authors/:authorId/followings:
                         /authors/:authorId/friends/:foreignId:
                         /authors/:authorId/inbox/requests:
                         /profile/:username:
    Request Type: GET
    Request Body: N/A
    Return: N/A
    */
    if (token == undefined) { return true }

    const login = await Login.findOne({token: token}).clone();
        
    if (login == null) { return true; }

    let expiresAt = new Date(login.expires);
    let current = new Date();

    if (expiresAt.getTime() < current.getTime()) { return true; }
    return false
}

async function checkAdmin(req){
    /**
    Description: Authenticates admin
    Associated Endpoint: /admin/dashboard:
    Request Type: GET
    Request Body: N/A
    Return: N/A
    */
    if (req.cookies.token != undefined) {
        const login_session = await Login.findOne({token: req.cookies.token});
        if (login_session == null) { return false; }
        if (login_session.admin === false) { return false; }
        if (login_session.admin === true) { return true; }
    }
    return false;
}

async function authAuthor(req, res) {
    /**
    Description: 
    Associated Endpoint: (for example: /authors/:authorid)
    Request Type: 
    Request Body: (for example: { username: kc, email: 123@aulenrta.ca })
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
    */
    const username = req.body.username;
    const password = req.body.password;


    if(!username || !password){ return res.sendStatus(400); }

    const author = await Author.findOne({username: req.body.username});

    if (!author) { return res.sendStatus(404); }
    req.author = author;

    if (!author.allowed) {
        return res.sendStatus(401);
    }

    const p_hashed_password = req.author.password;
    if(p_hashed_password == crypto_js.SHA256(password)){
        if(req.cookies.token != null && req.cookies.token != undefined){
            await Login.deleteOne({token: req.cookies.token}, function(err, login) { if (err) { return res.sendStatus(500); } }).clone()
        }

        if (req.baseUrl == '/admin') { if (!req.author.admin) { return res.sendStatus(403); } }

        let curr = new Date();
        let expiresAt = new Date(curr.getTime() + (1440 * 60 * 1000));
        let token = uidgen.generateSync();
        let uuid = String(crypto.randomUUID()).replace(/-/g, "");

        let login = new Login({
            _id: uuid,
            authorId: req.author._id,
            username: req.body.username,
            token: token,
            admin: req.author.admin,
            expires: expiresAt
        });

        login_saved = await login.save();
        if(login_saved){
            res.setHeader('Set-Cookie', 'token=' + token + '; SameSite=Strict' + '; HttpOnly' + '; Secure')
            return res.sendStatus(200)
        }
        return res.sendStatus(500)
    }
    return res.sendStatus(500)
}

async function authLogin(token, authorId){
    /**
    Description: 
    Associated Endpoint: (for example: /authors/:authorid)
    Request Type: 
    Request Body: (for example: { username: kc, email: 123@aulenrta.ca })
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
    */
    if (await checkExpiry(token)) { return false; }

    const login = await Login.findOne({token: token});  

    if (!login || login.authorId != authorId) { return false; }
    return true;
}

module.exports = {
    authAuthor,
    removeLogin,
    checkUsername,
    checkExpiry,
    checkAdmin,
    authLogin
}
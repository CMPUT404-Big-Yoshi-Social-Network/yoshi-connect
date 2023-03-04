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
const crypto_js = require('crypto-js')

// Used for tokens
const UIDGenerator = require('uid-generator')
const uidgen = new UIDGenerator();

// Fetching database 
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;

// Fetching schemas
const { authorScheme, loginScheme } = require('../db_schema/authorSchema.js');
const Login = database.model('Login', loginScheme);
const Author = database.model('Author', authorScheme);

async function checkUsername(req, res) {
    await Author.findOne({username: req.body.username}, function(err, author){
        if(author){
            console.log("Debug: Username is taken, Authentication failed.");
            return res.json({
                status: false
            });
        } else {
            return res.json({
                status: true
            });
        }
    }).clone()
}

async function removeLogin(req, res) {
    if (req.cookies["token"] != undefined) {
        console.log('Debug: Getting the token in the login database.');
        Login.deleteOne({token: req.cookies["token"]}, function(err, login) {
            if (err) throw err;
            console.log("Debug: Login token deleted.");
        })
    }
    return res.json({
        status: "Expired"
    });
}

async function checkExpiry(req) {
    if(req.cookies == undefined){ return "Expired"; }

    if (req.cookies["token"] != undefined) {
        console.log('Debug: Checking the Expiry Date of Token.');
        const login = await Login.findOne({token: req.cookies["token"]}).clone();
        if(login == null) { return "Expired"; }

        let expiresAt = new Date(login.expires);
        let current = new Date();
        if (expiresAt.getTime() < current.getTime()) { return "Expired" } else { return "Not Expired" }
    }
    return "Expired"
}

async function sendCheckExpiry(req, res){
    let expiry = await checkExpiry(req);
    if (expiry == "Not Expired") {
        return res.json({
            status: "Not Expired"
        });
    }
    else { return res.sendStatus(401); }
}

async function checkAdmin(req, res) {
    if (req.cookies["token"] != undefined) {
        console.log('Debug: Checking the admin status of the Token.');
        const login_session = await Login.findOne({token: req.cookies["token"]});
        if(login_session == null) { return false; }
        if (login_session.admin === false) { return false; }
        if (login_session.admin === true) { return true; }
    }
    return false;
}

async function authAuthor(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        console.log("Debug: Username or Password not given, Authentication failed");
        return res.json({
            status: false
        });
    }

    const author = await Author.findOne({username: req.body.username});

    if(!author){
        console.log("Debug: Author does not exist, Authentication failed");
        return res.json({ status: false });
    }

    console.log("Server's model: ", req.author);
    req.author = author;

    const p_hashed_password = req.author.password;
    if(p_hashed_password == crypto_js.SHA256(password)){
        console.log("Debug: Authentication successful.");
        if(req.cookies["token"] != null) {
            await Login.deleteOne({token: req.cookies["token"]}, function(err, login) {
                if (err) throw err;
                console.log("Debug: Login token deleted.");
            }).clone()
        }

        let curr = new Date();
        let expiresAt = new Date(curr.getTime() + (1440 * 60 * 1000));
        let token = uidgen.generateSync();

        let login = new Login({
            authorId: req.author._id,
            username: req.body.username,
            token: token,
            admin: req.author.admin,
            expires: expiresAt
        });

        if (req.route.path == '/admin') {
            if (!req.author.admin) {
                console.log("Debug: You are not an admin. Your login will not be cached.")
                return res.json({
                    status: false
                }); 
            }
        }

        login_saved = await login.save();
        if(login == login_saved){
            console.log("Debug: Login cached.")
            res.setHeader('Set-Cookie', 'token=' + token + '; SameSite=Strict' + '; HttpOnly' + '; Secure')
            return res.json({
                status: true
            });
        }
        return res.json({
            status: false
        });
    }
    return res.json({
        status: false
    });
}

module.exports = {
    authAuthor,
    removeLogin,
    checkUsername,
    checkExpiry,
    sendCheckExpiry,
    checkAdmin
}
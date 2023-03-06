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

// Database
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

// Schemas
const { Author, Login } = require('./db_schema/author_schema.js');

async function checkUsername(req) {
    const author = await Author.findOne({username: req.body.username});

    if(author == undefined)
        return "Not in use";

    if(author.username == req.body.username){
        console.log("Debug: Username is taken, Authentication failed");
        return "In use";
    }
    return "Not in use";
}

async function removeLogin(req, res) {
    if (req.cookies["token"] != undefined) {
        console.log('Debug: Getting the token in the login database.');
        Login.deleteOne({token: req.cookies["token"]}, function(err, login) {
            if (err) throw err;
            console.log("Debug: Login token deleted");
        })
    }
    return res.json({
        message: "Logged out.",
        status: "Expired"
    });
}
/*
Returns:
    True: If Token is expired
    False: If Token is not expired
*/
async function checkExpiry(req) {
    if(req.cookies == undefined){
        return true
    }

    if (req.cookies["token"] != undefined) {
        console.log('Debug: Checking the Expiry Date of Token')
        const login = await Login.findOne({token: req.cookies["token"]}).clone();
        if(login == null)
            return true;
        let expiresAt = new Date(login.expires);
        let current = new Date();
        if (expiresAt.getTime() < current.getTime()) {
            return true
        } 
        else {
            return false
        }
    }
    return true
}

async function sendCheckExpiry(req, res){
    if(!(await checkExpiry(req))){
        return res.json({
            message: "Token still valid.",
            status: "Not Expired"
        });
    }
    else{
        return res.sendStatus(401);
    }
}

async function checkAdmin(req, res){
    if (req.cookies["token"] != undefined) {
        console.log('Debug: Checking the admin status of the Token')
        const login_session = await Login.findOne({token: req.cookies["token"]});
        if(login_session == null)
            return false;
        if (login_session.admin === false)
            return false;
        if (login_session.admin === true)
            return true;
    }
    return false;
}

async function authAuthor(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    if(!username || !password){
        console.log("Debug: Username or Password not given, Authentication failed");
        return res.json({
            message: "You are missing username or password.",
            status: "Unsuccessful"
        });
    }

    const author = await Author.findOne({username: req.body.username});

    if(!author){
        console.log("Debug: Author does not exist, Authentication failed");
        return res.json({
            status: false
        });
    }
    req.author = author;

    const p_hashed_password = req.author.password;
    console.log("Server's model: ", req.author);
    if(p_hashed_password == crypto_js.SHA256(password)){
        console.log("Debug: Authentication successful");
        //Check if login already exists if it does send back the old one else create a new one 
        if(req.cookies["token"] != null){
            await Login.deleteOne({token: req.cookies["token"]}, function(err, login) {
                if (err) throw err;
                console.log("Debug: Login token deleted");
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
            console.log("Debug: Login Cached.")
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
const crypto_js = require('crypto-js')
const UIDGenerator = require('uid-generator')
const uidgen = new UIDGenerator();
const { author_scheme, login_scheme } = require('./db_schema/author_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;
const Login = database.model('Login', login_scheme);
const Author = database.model('Author', author_scheme);

function isPersonal(req, res) {
    if (req.body.data.token != null) {
        console.log('Debug: Getting the token in the login database.')
        Login.findOne({token: req.body.data.token}, function(err, login) {
            if (err) throw err;
            return res.json({
                username: login.username
            });
        })  
    }
}

async function checkUsername(req, res) {
    await Author.findOne({username: req.body.username}, function(err, author){
        if(author){
            console.log("Debug: Username is taken, Authentication failed");
            return res.json({
                status: "Unsuccessful"
            });
        } else {
            return res.json({
                status: "Successful"
            });
        }
    }).clone()
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

async function checkExpiry(req, res) {
    if(req.cookies == undefined){
        return res.json({
            message: "Token is expired.",
            status: "Expired"
        });
    }

    if (req.cookies["token"] != undefined) {
        console.log('Debug: Checking the Expiry Date of Token')
        Login.findOne({token: req.cookies["token"]}, function(err, login) {
            if (err) throw err;
            if(login == null){
                return res.json({
                    message: "Token is expired.",
                    status: "Expired"
                });
            } 
            let expiresAt = new Date(login.expires);
            let current = new Date();
            if (expiresAt.getTime() < current.getTime()) {
                return res.json({
                    message: "Token is expired.",
                    status: "Expired"
                });
            } else {
                return res.json({
                    message: "Token still valid.",
                    status: "Not Expired"
                });
            }
        })
    }
    return;
}

function checkAdmin(req, res){
    if (req.cookies["token"] != undefined) {
        console.log('Debug: Checking the admin status of the Token')
        Login.findOne({token: req.cookies["token"]}, function(err, login) {
            if (err) throw err;
            if(login == null){
                return res.json({
                    message: "Token is expired.",
                    status: "Expired"
                });
            }
            if (login.admin === false) {
                return res.json({
                    message: "You are not an admin.",
                    status: "NonAdmin"
                });
            }
        })
    }
    return undefined;
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

    await Author.findOne({username: req.body.username}, async function(err, author){
        if(!author){
            console.log("Debug: Author does not exist, Authentication failed");
            return res.json({
                username: req.body.username,
                status: "Unsuccessful"
            });
        }
        req.author = author;

        const p_hashed_password = req.author.password;
        console.log("Server's model: ", req.author);
        if(p_hashed_password == crypto_js.SHA256(password)){
            console.log("Debug: Authentication successful");
            //Check if login already exists if it does send back the old one else create a new one 
            if(req.body.token != null){
                await Login.deleteOne({token: req.body.token}, function(err, login) {
                    if (err) throw err;
                    console.log("Debug: Login token deleted");
                }).clone
            }

            let curr = new Date();
            let expiresAt = new Date(curr.getTime() + (1440 * 60 * 1000));
            let token = uidgen.generateSync();

            let login = new Login({
                authorId: req.author.authorId,
                username: req.body.username,
                token: token,
                admin: req.author.admin,
                expires: expiresAt
            });

            if (req.route.path == '/admin') {
                if (!req.author.admin) {
                    console.log("Debug: You are not an admin. Your login will not be cached.")
                    return res.json({
                        username: req.body.username,
                        authorId: req.author.authorId,
                        status: "Unsuccessful"
                    }); 
                }
            }

            login.save((err, login, next) => {
                if (err) {
                    console.log(err);
                    return;
                } 
                console.log("Debug: Login Cached.")
                res.setHeader('Set-Cookie', 'token=' + token + '; SameSite=Strict' + '; HttpOnly' + '; Secure')
                return res.json({
                    username: req.body.username,
                    authorId: req.author.authorId,
                    status: "Successful"
                });
            });
            return;
        }
    }).clone()
    return;
}

module.exports = {
    authAuthor,
    removeLogin,
    checkUsername,
    checkExpiry,
    checkAdmin,
    isPersonal
}
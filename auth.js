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
                    username: req.body.username,
                    authorId: req.author.authorId,
                    status: "Unsuccessful"
                }); 
            }
        }

        login_saved = await login.save();
        if(login == login_saved){
            console.log("Debug: Login Cached.")
            res.setHeader('Set-Cookie', 'token=' + token + '; SameSite=Strict' + '; HttpOnly' + '; Secure')
            return res.json({
                username: req.body.username,
                authorId: req.author.authorId,
                status: "Successful"
            });
        }
        return res.json({
            username: req.body.username,
            status: "Unsuccessful"
        });
    }
    return res.json({
        username: req.body.username,
        status: "Unsuccessful"
    });
}

module.exports = {
    authAuthor,
    removeLogin,
    checkUsername,
    checkExpiry,
    sendCheckExpiry,
    checkAdmin,
    isPersonal
}
const crypto_js = require('crypto-js')
const UIDGenerator = require('uid-generator')
const uidgen = new UIDGenerator();
const { Author, Login, Account } = require('./db_schema/author_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

async function checkDisplayName(req) {
    const author = await Author.findOne({displayName: req.body.displayName});

    if (author == undefined) { return "Not in use"; }

    if (author.displayName == req.body.displayName) {
        console.log("Debug: Username is taken, Authentication failed");
        return "In use";
    } else {
        return "Not in use";
    }
}

async function removeLogin(req, res) {
    if (req.cookies["token"] != undefined) {
        console.log('Debug: Getting the token in the login database.');
        Login.deleteOne({token: req.cookies["token"]}, function(err, login) {
            if (err) throw err;
            console.log("Debug: Login token deleted");
        })
    }
    return res.json({ status: "Expired" });
}

async function checkExpiry(req) {
    if(req.cookies == undefined) { return true; }

    if (req.cookies["token"] != undefined) {
        console.log('Debug: Checking the Expiry Date of Token')

        const login = await Login.findOne({token: req.cookies["token"]}).clone();
        if(login == null) { return true; }

        let expiresAt = new Date(login.expires);
        let current = new Date();
        if (expiresAt.getTime() < current.getTime()) { return true } 
        else { return false; }
    } else {
        return true;
    }
}

async function sendCheckExpiry(req, res){
    if (!(await checkExpiry(req))) {
        return res.json({ status: "Not Expired" });
    } else { 
        return res.sendStatus(401); 
    }
}

async function checkAdmin(req, res){
    if (req.cookies["token"] != undefined) {
        console.log('Debug: Checking the admin status')

        const login = await Login.findOne({token: req.cookies["token"]});

        if(login == null) { 
            return false; 
        } else if (login.admin === false) { 
            return false; 
        } else if (login.admin === true) { 
            return true; 
        }
    } else { 
        return false; 
    }
}

async function authAuthor(req, res) {
    const displayName = req.body.displayName;
    const password = req.body.password;

    if (!displayName || !password) {
        console.log("Debug: displayName or Password not given, Authentication failed");
        return res.json({ status: "Unsuccessful" });
    }

    const account = await Account.findOne({displayName: req.body.displayName});
    const author = await Author.findOne({displayName: req.body.displayName});

    if (!account || !author) {
        console.log("Debug: Author does not exist, Authentication failed");
        return res.json({ status: "Unsuccessful" });
    } else {
        req.account = account;
        req.author = author;
    }

    const hashedPassword = req.account.password;
    if(hashedPassword == crypto_js.SHA256(password)){
        console.log("Debug: Authentication successful");
        if (req.cookies["token"] != null) {
            await Login.deleteOne({token: req.cookies["token"]}, function(err, login) {
                if (err) throw err;
                console.log("Debug: Login token deleted");
            }).clone()
        }

        let curr = new Date();
        let expiresAt = new Date(curr.getTime() + (1440 * 60 * 1000));
        let token = uidgen.generateSync();
        let login = new Login({
            type:'login',
            authorId: req.author._id,
            token: token,
            expires: expiresAt,
            admin: req.account.admin
        });

        if (req.route.path == '/admin') {
            if (!req.account.admin) {
                console.log("Debug: You are not an admin. Your login will not be cached.")
                return res.json({ status: "Unsuccessful" }); 
            }
        }

        savedLogin = await login.save();
        if(login == savedLogin){
            console.log("Debug: Login Cached.")
            res.setHeader('Set-Cookie', 'token=' + token + '; SameSite=Strict' + '; HttpOnly' + '; Secure')
            return res.json({ status: "Successful" });
        } else {
            return res.json({ status: "Unsuccessful" });
        }
    } else {
        return res.json({ status: "Unsuccessful" });
    }
}

module.exports = {
    authAuthor,
    removeLogin,
    checkDisplayName,
    checkExpiry,
    sendCheckExpiry,
    checkAdmin
}
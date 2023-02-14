const crypto_js = require('crypto-js')
const UIDGenerator = require('uid-generator')
const uidgen = new UIDGenerator();
const { login_scheme } = require('./db_schema/author_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;
const Login = database.model('Login', login_scheme);

async function removeLogin(req, res) {
    if (req.body.data != undefined) {
        console.log('Debug: Getting the token in the login database.')
        Login.deleteOne({token: req.body.data}, function(err, obj) {
            if (err) throw err;
            console.log("Debug: Login token deleted");
        })
    }
    return undefined;
}

async function authAuthor(req, res) {
    const { getAuthor } = require('./server');
    const username = req.body.username;
    const password = req.body.password;
    if(!username || !password){
        console.log("Debug: Username or Password not given, Authentication failed");
        return res.json({
            message: "You are missing username or password.",
            status: "Unsuccessful"
        });
    }

    const possible_author = await getAuthor(req, res);
    if(!possible_author){
        console.log("Debug: Author does not exist, Authentication failed");
        return res.json({
            username: req.body.username,
            status: "Unsuccessful"
        });
    }
    const p_hashed_password = req.author.password;
    console.log("Server's model: ", req.author);
    console.log("Server's Hashed password: ", p_hashed_password)
    console.log("Client's Hashed password: ", crypto_js.SHA256(password))
    if(p_hashed_password == crypto_js.SHA256(password)){
        console.log("Debug: Authentication successful");
        let token = uidgen.generateSync();
        let login = new Login({
            authorId: req.author.authorId,
            username: req.body.username,
            token: token,
            admin: req.author.admin,
            expires: req.headers.expires
        });

        login.save((err, login, next) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log("Debug: Login Cached.")
            return res.json({
                token,
                username: req.body.username,
                authorId: req.author.authorId,
                admin: req.author.admin,
                status: "Successful"
            });
        });
        return;
    }
    return;
}

module.exports = {
    authAuthor,
    removeLogin
}
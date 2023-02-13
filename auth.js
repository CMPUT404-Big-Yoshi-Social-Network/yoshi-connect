const crypto_js = require('crypto-js')
const UIDGenerator = require('uid-generator')
const uidgen = new UIDGenerator();
const { login_scheme } = require('./db_schema/author_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;
const Login = database.model('Login', login_scheme);

async function authAuthor(req, res) {
    const { getAuthor } = require('./server');
    console.log(req);
    const username = req.body.username;
    const password = req.body.password;
    if(!username || !password){
        console.log("Authentication failed");
        return res.json({
            message: "missing username or password",
            status: "unsuccessful"
        });
    }

    const possible_author = await getAuthor(req, res);
    if(!possible_author){
        console.log("Authentication failed");
        return res.json({
            username: req.body.username,
            status: "unsuccessful"
        });
    }
    const p_hashed_password = req.author.password;
    console.log("Server's model: ", req.author);
    console.log("Server's Hashed password: ", p_hashed_password)
    console.log("Client's Hashed password: ", crypto_js.SHA256(password))
    if(p_hashed_password == crypto_js.SHA256(password)){
        console.log("Authentication successful");

        let token = uidgen.generateSync();
        let login = new Login({
            authorId: req.author.authorId,
            username: req.body.username,
            token: token,
            admin: req.author.admin
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
                status: "successful"
            });
        });
        return;
    }
    return;
}

async function authAdmin(req, res) {
    const { getAuthor } = require('./server');
    console.log('Debug: Checking if the admin header is true for the user.')

    const possible_author = await getAuthor(req, res);

    if(!possible_author){
        console.log("Authentication failed");
        res.send("Admin access Unsuccessful");
    }

    if (!req.author.admin) {
        res.status(401) // 401 Unauthorized 
        return res.send('You are not an admin!');
    } else {
        res.status(301) // Bad route?
        res.redirect('/admin/dashboard.html');
    }
}

module.exports = {
    authAuthor,
    authAdmin,
}
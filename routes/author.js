const crypto_js = require('crypto-js');
const UIDGenerator = require('uid-generator')
const uidgen = new UIDGenerator();
const { author_scheme, login_scheme } = require('../db_schema/author_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;
const Author = database.model('Author', author_scheme);
const Login = database.model('Login', login_scheme);

async function register_author(req, res){
    await Author.findOne({username: req.body.data.username}, function(err, author){
        if(author){
            console.log("Debug: Author does exist, Authentication failed");
            return res.json({
                username: req.body.data.username,
                status: "Unsuccessful"
            });
        } else {
            req.author = author;
        }
    }).clone()
    console.log("Debug: Author does not exist yet.")

    const authorId = (await Author.find().sort({authorId:-1}).limit(1))[0].authorId + 1;

    //Check to make sure username, password, and email are present
    const username = req.body.data.username;
    const email = req.body.data.email;
    const password = req.body.data.password;
    if( !username || !email || !password ){
        console.log("Debug: Did not fill in all the cells.")
        return res.json({
            message: "You are missing username or email or password.",
            status: "Unsuccessful"
        });
    }

    var author = new Author({
        authorId: authorId,
        username: username,
        password: crypto_js.SHA256(password),
        email: email,
        about: "...",
        pronouns: ".../...",
        admin: false
    });

    author.save((err, author, next) => {
        if(err){
            console.log(err);
            return res.json({
                message: "You could not be added to the database.",
                status: "Unsuccessful"
            });
        }
        console.log("Debug: " + author.username + " added successfully to database");
        let token = uidgen.generateSync();
        let login = new Login({
            authorId: authorId,
            username: username,
            token: token,
            expires: req.headers.expires,
            admin: false
        });
        login.save((err, login, next) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log("Debug: Login Cached.")
            return res.json({
                token,
                username: username,
                authorId: authorId,
                status: "Successful"
            });
        })
    });
}

module.exports={
    register_author
}
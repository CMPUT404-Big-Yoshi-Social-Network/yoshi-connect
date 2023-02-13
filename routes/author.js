const crypto_js = require('crypto-js');
const { author_scheme } = require('../db_schema/author_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;
const Author = database.model('Author', author_scheme);

async function register_author(req, res){
    const { getAuthor } = require('../server');
    if( await getAuthor(req, res) ){
        console.log("Debug: Author already exists.")
        res.send("Unsuccessful, User Registration Incomplete");
        return;
    }
    console.log("Debug: Author does not exist yet.")

    const author_id = (await Author.find().sort({authorId:-1}).limit(1))[0].authorId + 1;

    //Check to make sure username, password, and email are present
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    if( !username || !email || !password ){
        console.log("Debug: Did not fill in all the cells.")
        res.send("Unsuccessful, User Registration Incomplete");
        return;
    }

    var author = new Author({
        authorId: author_id,
        username: username,
        password: crypto_js.SHA256(password),
        email: email,
        about: "To be added",
        pronouns: "None/Specified",
        admin: false
    });

    author.save((err, author, next) => {
        if(err){
            console.log(err);
            return;
        }
        console.log("Debug: " + author.username + " added successfully to database");
        return res.redirect('/feed');
    });
    //TODO: Send a JWT or other form of authentication to the client
}

module.exports={
    register_author
}
const crypto_js = require('crypto-js');
const { author_scheme, login_scheme } = require('../db_schema/authorSchema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;
const Author = database.model('Author', author_scheme);
const Login = database.model('Login', login_scheme);

async function addAuthor(req, res){
    console.log('Debug: Adding a new author to YoshiConnect');

    let existingAuthor = await Author.findOne({username: req.body.data.username}).clone();

    if(existingAuthor){
        return res.sendStatus(400);
    }

    const username = req.body.data.username;
    const email = req.body.data.email;
    const password = req.body.data.password;

    let author = new Author({
        username: username,
        password: crypto_js.SHA256(password),
        email: email,
        about: "...",
        pronouns: ".../...",
        admin: req.body.data.admin
    });

    author.save((err) => {
        if(err){
            return res.sendStatus(500);
        }
        return res.sendStatus(200);
    });

    console.log("Debug: " + author.username + " added successfully to database");

}

async function modifyAuthor(req, res){

    const author = await Author.findOne({_id: req.body.data.authorId}).clone();
    if(author == undefined){ 
        console.log('Debug: Could not find author.')
        return res.sendStatus(404); 
    }

    if (author.username != req.body.data.newUsername) {
        console.log('Debug: Checking if username is taken.')
        existing_author = await Author.findOne({username: req.body.data.newUsername});
        if(existing_author){
            return res.sendStatus(400);
        }
    }

    console.log('Debug: Found the author');
    author.username = req.body.data.newUsername;
    author.password = crypto_js.SHA256(req.body.data.newPassword);
    author.email = req.body.data.newEmail;
    author.about = req.body.data.newAbout;
    author.pronouns = req.body.data.newPronouns;
    author.admin = req.body.data.newAdmin;
    author.save();

    await Login.find({authorId: req.body.data.authorId}, function(err, logins){
        if(err){
            res.sendStatus(500);
        }
        for(let i = 0; i < logins.length; i++){
            logins[i].username = req.body.data.newUsername;
            logins[i].admin = req.body.data.newAdmin;
            logins[i].save();
        }
        return res.sendStatus(200);
    }).clone();
}

async function deleteAuthor(req, res){
    console.log('Debug: Attempt to delete an author.')
    await Author.deleteOne({username: req.body.username}, function(err, deleteObj){
        if(deleteObj.deletedCount == 0){
            return res.sendStatus(404);
        }

        Login.deleteMany({username: req.body.username}, function(err, delete_count_obj) {
            return res.sendStatus(200)
        }).clone();
    }).clone();
}

module.exports={
    addAuthor,
    modifyAuthor,
    deleteAuthor
}
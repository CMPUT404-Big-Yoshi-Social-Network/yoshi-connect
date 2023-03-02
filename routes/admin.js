const crypto_js = require('crypto-js');
const { author_scheme } = require('../db_schema/author_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;
const Author = database.model('Author', author_scheme);
import { checkIfExists } from './author.js';

async function addAuthor(req, res){
    console.log('Debug: Adding a new author to YoshiConnect');

    checkIfExists(req);

    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    var author = new Author({
        username: username,
        password: crypto_js.SHA256(password),
        email: email,
        about: "...",
        pronouns: ".../...",
        admin: req.body.admin
    });

    author.save(async (err, author, next) => {
        if(err){
            console.log(err);
            return res.json({
                status: "Unsuccessful"
            });
        }
        console.log("Debug: " + author.username + " added successfully to database");
    });

    return res.json({
        status: "Successful",
        username: username,
        password: password
    })

    // Need to discuss how the author will get the credentials
}

async function modifyAuthor(req, res){
    let updated_author = null;
    await Author.findOne({username: req.body.data.oldUsername}, function(err, author){
        if (author) {
            if (req.body.data.toChange == 'Username') {
                author.username = req.body.data.newUsername;
            } else if (req.body.data.toChange == 'Password') {
                author.password = crypto_js.SHA256(req.body.data.newPassword);
            } else if (req.body.data.toChange == 'Email') {
                author.email = req.body.data.newEmail;
            } else if (req.body.data.toChange == 'About') {
                author.about = req.body.data.newAbout;
            } else if (req.body.data.toChange == 'Pronouns') {
                author.pronouns = req.body.data.newPronouns;
            } else if (req.body.data.toChange == 'Admin') {
                author.admin = req.body.data.newAdmin;
            }
            updated_author = author;
        } 
    }).clone()
    if (updated_author != null) {
        await Author.replaceOne({_id: req.body.data.authorId}, { 
            username: updated_author.username, 
            password: updated_author.password, 
            email: updated_author.email, 
            about: updated_author.about, 
            pronouns: updated_author.pronouns, 
            admin: updated_author.admin, 
        }).clone()
    }

    return res.json({
        status: "Successful"
    })
}

async function deleteAuthor(req, res){
    console.log('Debug: Attempt to delete an author.')
    await Author.deleteOne({username: req.body.data.username}, function(err, author){
        if(author){
            console.log("Debug: Author does exist and was deleted.");
            return res.json({
                status: "Successful"
            });
        } else {
            return res.json({
                status: "Unsuccessful"
            });
        }
    }).clone()
}

module.exports={
    addAuthor,
    modifyAuthor,
    deleteAuthor
}
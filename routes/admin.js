const crypto_js = require('crypto-js');
const { author_scheme, login_scheme } = require('../db_schema/author_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;
const Author = database.model('Author', author_scheme);
const Login = database.model('Login', login_scheme);

async function addAuthor(req, res){
    console.log('Debug: Adding a new author to YoshiConnect');

    let author_found = await Author.findOne({username: req.body.data.username}, function(err, author){
        if(!author){
            return;
        }
        console.log("Debug: Author does exist, Authentication failed");
        return res.json({
            username: req.body.data.username,
            status: "Unsuccessful"
        });
    }).clone()
    if(author_found) {
        return;
    }

    const username = req.body.data.username;
    const email = req.body.data.email;
    const password = req.body.data.password;

    var author = new Author({
        username: username,
        password: crypto_js.SHA256(password),
        email: email,
        about: "...",
        pronouns: ".../...",
        admin: req.body.data.admin
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
    await Author.findOne({_id: req.body.data.authorId}, function(err, author){
        if (author) {
            console.log('Debug: Found the author')
            author.username = req.body.data.newUsername;
            author.password = crypto_js.SHA256(req.body.data.newPassword);
            author.email = req.body.data.newEmail;
            author.about = req.body.data.newAbout;
            author.pronouns = req.body.data.newPronouns;
            author.admin = req.body.data.newAdmin;
            updated_author = author;
        } 
    }).clone()

    let updated_login = null;
    await Login.findOne({authorId: req.body.data.authorId}, function(err, login){
        if (login) {
            console.log('Debug: Update login credentials if it exists')
            login.username = req.body.data.newUsername;
            login.admin = req.body.data.newAdmin;
            updated_login = login;
        } 
    }).clone()
    if (updated_author != null) {
        await Author.findOneAndReplace({_id: updated_author._id}, { 
            _id: updated_author._id,
            username: updated_author.username, 
            password: updated_author.password, 
            email: updated_author.email, 
            about: updated_author.about, 
            pronouns: updated_author.pronouns, 
            admin: updated_author.admin, 
        }).clone()
        if (updated_login != null) {
            await Login.findOneAndReplace({authorId: updated_login.authorId}, { 
                _id: updated_login._id,
                authorId: updated_login.authorId,
                username: updated_login.username,
                token: updated_login.token, 
                admin: updated_login.admin,
                expires: updated_login.expires 
            }).clone()
        }
    }

    return res.json({
        status: "Successful"
    })
}

async function deleteAuthor(req, res){
    console.log('Debug: Attempt to delete an author.')
    await Author.deleteOne({username: req.body.username}, function(err, author){

        if(!author){
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
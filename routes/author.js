const crypto_js = require('crypto-js');
const UIDGenerator = require('uid-generator')
const uidgen = new UIDGenerator();
const { Author, Login } = require('../db_schema/author_schema.js');
const { checkUsername } = require('../auth.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const { PostHistory } = require('../db_schema/post_schema.js');
const { createFollowers, createFollowings, createFriends } = require('./relations.js');

async function register_author(req, res){
    if(await checkUsername(req) === "In use")
        //TODO: Make this a 400
        return res.json({
            message: "Username already in use.",
            status: "Unsuccessful"
        });
        
    console.log("Debug: Author does not exist yet.");

    //Check to make sure username, password, and email are present
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    if( !username || !email || !password ){
        console.log("Debug: Did not fill in all the cells.");
        //TODO: Make this a 400
        return res.json({
            message: "You are missing username or email or password.",
            status: "Unsuccessful"
        });
    }

    var author = new Author({
        username: username,
        password: crypto_js.SHA256(password),
        email: email,
        about: "...",
        pronouns: ".../...",
        admin: false
    });
    
    let saved_author = await author.save();

    console.log("Debug: " + author.username + " added successfully to database");
        
    let curr = new Date();
    let expiresAt = new Date(curr.getTime() + (1440 * 60 * 1000));
    let token = uidgen.generateSync();

    let login = new Login({
        authorId: author._id,
        username: username,
        token: token,
        admin: false,
        expires: expiresAt
    });

    await login.save((err, login) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log("Debug: Login Cached.")
        res.setHeader('Set-Cookie', 'token=' + token + '; SameSite=Strict' + '; HttpOnly' + '; Secure')
        return res.json({
            sessionId: token,
            status: "Successful"
        });
    })

    await author.save(async (err, author, next) => {
        if(err){
            console.log(err);
            //TODO Make this a 400
            return res.json({
                status: "Unsuccessful"
            });
        }
    });

    await create_post_history(author._id);
    await createFollowers(author.username, author._id);
    await createFriends(author.username, author._id);
    await createFollowings(author.username, author._id);

}

async function get_profile(req, res) {
    if(req.cookies == undefined){
        return res.sendStatus(404);
    }
    else if(req.cookies["token"] == undefined){
        return res.sendStatus(404);
    }

    console.log('Debug: Getting the token in the login database.')
    const login = await Login.findOne({token: req.cookies["token"]});

    if(login == undefined){
        return res.sendStatus(404);
    }

    const author = await Author.findOne({username: req.path.split("/")[req.path.split("/").length - 1]})

    if(!author){
        return res.sendStatus(404);
    }
    else if(author.username == login.username){
        console.log("Debug: This is your personal account.")
        return res.json({
            viewed: author.username,
            viewer: login.username,
            personal: true
        });
    }
    else if(author.username != login.username){
        console.log("Debug: This is not your personal account.")
        return res.json({
            viewed: author.username,
            viewer: login.username,
            personal: false
        });
    }
}

async function getCurrentAuthor(req, res){
    await Login.findOne({token: req.cookies.token}, function(err, login) {
        console.log('Debug: Retrieving current author logged in')
        if(!login){
            return res.sendStatus(404);
        }

        return res.json({
            authorId: login.authorId
        });

    }).clone();
}

async function getCurrentAuthorUsername(req, res){
    await Login.findOne({token: req.cookies.token}, function(err, login) {
        console.log('Debug: Retrieving current author logged in')
        if(!login){
            return res.sendStatus(404);            
        }

        return res.json({
            username: login.username
        })
        
    }).clone();
}

async function fetchMyPosts(req, res) {
    console.log('Debug: Getting friends posts');
    const login = await Login.findOne({token: req.cookies.token}).clone();
    if (!login) { return res.sendStatus(404); }

    console.log('Debug: Retrieving current author logged in')
    const authorId = login.authorId
    await PostHistory.findOne({authorId: authorId}, function(err, history){
        console.log("Debug: History exists");
        return res.json({
            posts: history.posts
        });
    }).clone()
}

module.exports={
    register_author,
    get_profile,
    getCurrentAuthor,
    getCurrentAuthorUsername,
    fetchMyPosts
}
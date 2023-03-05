const crypto_js = require('crypto-js');
const UIDGenerator = require('uid-generator')
const uidgen = new UIDGenerator();
const { Author, Login, Account, Authors } = require('../db_schema/author_schema.js');
const { checkDisplayName } = require('../auth.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const { create_post_history } = require('./post.js');
const { createFollowers, createFollowings, createFriends } = require('./relations.js');

async function register_author(req, res){
    if(await checkDisplayName(req) === "In use") { return res.sendStatus(400); }
    console.log("Debug: Author does not exist yet.");

    let authors = await Authors.find().clone();
    if (authors === undefined || authors === null) {
        authors = new Authors({
            type: 'authors',
            items: []
        });  
        await authors.save();      
    }

    const displayName = req.body.displayName;
    const email = req.body.email;
    const password = req.body.password;
    if( !username || !email || !password ){ return res.sendStatus(400); }

    var account = new Account({
        type: 'account',
        displayName: displayName,
        password: crypto_js.SHA256(password),
        email: email,
        about: "",
        pronouns: "",
        admin: false
    });
    await account.save();

    var author = new Author({
        type: 'author',
        displayName: displayName,
        url: '',
        host: '',
        github: '',
        profileImage: ''
    });
    await author.save();

    authors.items.push(author);
    authors.save();

    console.log("Debug: " + author.displayName + " added successfully to database");
        
    let curr = new Date();
    let expiresAt = new Date(curr.getTime() + (1440 * 60 * 1000));
    let token = uidgen.generateSync();

    let login = new Login({
        type: 'login',
        authorId: author._id,
        token: token,
        expires: expiresAt,
        admin: account.admin
    });

    login.save((err, login) => {
        if (err) { return; }
        console.log("Debug: Login Cached.")
        res.setHeader('Set-Cookie', 'token=' + token + '; SameSite=Strict' + '; HttpOnly' + '; Secure')
        return res.json({ status: "Successful" });
    })

    author.save(async (err, author, next) => { if (err) { return res.sendStatus(400); } });
    account.save(async (err, account, next) => { if (err) { return res.sendStatus(400); } });

    await create_post_history(author._id);
    await createFollowers(author._id);
    await createFriends(author._id);
    await createFollowings(author._id);
}

async function get_profile(req, res) {
    if (req.cookies == undefined || req.cookies["token"] == undefined) { return res.sendStatus(404); } 

    console.log('Debug: Getting the token in the login database.')
    const login = await Login.findOne({token: req.cookies["token"]});
    if (login == undefined) { return res.sendStatus(404); }

    const author = await Author.findOne({displayName: req.path.split("/")[req.path.split("/").length - 1]})
    if (!author) { 
        return res.sendStatus(404); 
    } else if (author.displayName == login.displayName) {
        console.log("Debug: This is your personal account.")
        return res.json({
            viewed: author.displayName,
            viewer: login.displayName,
            personal: true
        });
    } else if (author.displayName != login.displayName) {
        console.log("Debug: This is not your personal account.")
        return res.json({
            viewed: author.displayName,
            viewer: login.displayName,
            personal: false
        });
    }
}

async function getCurrentAuthor(req, res){
    await Login.findOne({token: req.body.data.sessionId}, function(err, login) {
        console.log('Debug: Retrieving current author logged in')
        if (!login) { return res.sendStatus(404); }
        return res.json({ authorId: login.authorId });
    }).clone();
}

async function getCurrentAuthorUsername(req, res){
    await Login.findOne({token: req.body.data.sessionId}, function(err, login) {
        console.log('Debug: Retrieving current author logged in')
        if(!login){ return res.sendStatus(404); }
        return res.json({ displayName: login.displayName })
    }).clone();
}

module.exports={
    register_author,
    get_profile,
    getCurrentAuthor,
    getCurrentAuthorUsername
}
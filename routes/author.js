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
    let author_found = await Author.findOne({username: req.body.username}, function(err, author){
        if(!author){
            return;
        }
        console.log("Debug: Author does exist, Authentication failed");
        return res.json({
            username: req.body.username,
            status: "Unsuccessful"
        });
    }).clone()
    if(author_found) {
        return;
    }
    console.log("Debug: Author does not exist yet.")

    const authorId = (await Author.find().sort({authorId:-1}).limit(1))[0].authorId + 1;

    //Check to make sure username, password, and email are present
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    if( !username || !email || !password ){
        console.log("Debug: Did not fill in all the cells.")
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

    await author.save(async (err, author, next) => {
        if(err){
            console.log(err);
            return res.json({
                message: "You could not be added to the database.",
                status: "Unsuccessful"
            });
        }
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
                username: username,
                authorId: authorId,
                status: "Successful"
            });
        })
    });
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

module.exports={
    register_author,
    get_profile
}
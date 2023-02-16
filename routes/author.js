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
    if(author_found)
        return
        
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
        authorId: authorId,
        username: username,
        password: crypto_js.SHA256(password),
        email: email,
        about: "...",
        pronouns: ".../...",
        admin: false
    });

    await author.save((err, author, next) => {
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
            authorId: authorId,
            username: username,
            token: token,
            admin: false,
            expires: expiresAt
        });

        login.save((err, login, next) => {
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
    console.log(req.cookies);
    if (req.cookies["token"] != null) {

        console.log('Debug: Getting the token in the login database.')
        Login.findOne({token: req.cookies["token"]}, async function(err, login) {
            if (err) throw err;

            if(login == undefined){
                req.send(400);
            }
            /*
            if(login.username ===){

            }
            */
            username = login.username;
            await Author.findOne({username: username}, function(err, author){
                if(!author){
                    return res.json({
                        username: undefined,
                    });
                }
                console.log("Debug: Author does exist, Authentication failed");
                return res.json({
                    username: "tommy",
                    personal: true
                });
            }).clone()

            return res.json({
                username: login.username,
                personal: false 
            });
        })

    }
    else{
        //Sent back an error
    }
}

module.exports={
    register_author,
    get_profile
}
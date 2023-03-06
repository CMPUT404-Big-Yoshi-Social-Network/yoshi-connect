const crypto_js = require('crypto-js');
const UIDGenerator = require('uid-generator')
const uidgen = new UIDGenerator();
const { Author, Login } = require('../db_schema/author_schema.js');
const { checkUsername } = require('../auth.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const { PostHistory } = require('../db_schema/post_schema.js');
const { createFollowers, createFollowings, createFriends } = require('./relations.js');
const { create_post_history } = require('./post.js');

async function register_author(req, res){
    if(await checkUsername(req) === "In use") return res.sendStatus(400);
        
    console.log("Debug: Author does not exist yet.");

    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    if( !username || !email || !password ){
        console.log("Debug: Did not fill in all the cells.");
        return res.sendStatus(400);
    }

    const checkEmail = await Author.findOne({email: email})
    if (checkEmail === undefined) { return res.sendStatus(400); }

    var author = new Author({
        username: username,
        password: crypto_js.SHA256(password),
        email: email,
        about: "...",
        pronouns: ".../...",
        admin: false
    });
    
    await author.save();

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
            return res.sendStatus(400);
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
    const login = await Login.findOne({token: req.cookies.token})

    if(!login){
        return res.sendStatus(404);            
    }
    
    return res.json({
        username: login.username
    })
}

async function getCurrentAuthorAccountDetails(req, res) {
    const login = await Login.findOne({token: req.cookies.token})
    const author = await Author.findOne({_id: login.authorId})
    return res.json({
        username: author.username,
        email: author.email
    })
}

async function fetchMyPosts(req, res) {
    console.log('Debug: Getting posts');
    let author = null
    if (req.body.data.personal) {
        author = await Author.findOne({username: req.body.data.viewer}).clone();
    } else {
        author = await Author.findOne({username: req.body.data.viewed}).clone();
    }

    const posts = await PostHistory.aggregate([
        {
            $match: {
                $expr: {
                    $in : ["$authorId", [author._id]]
                }
            },
        },
        {
            $unwind: "$posts"
        },
        {
            $match: {
                $expr: {
                    $ne: ["$posts.unlisted", true]
                }
            }
        },
        {
            $set: {
                "posts.published": {
                    $dateFromString: {
                        dateString: "$posts.published"
                    }
                }
            }
        },
        {
            $addFields: {
                "posts.authorId": "$authorId"
            }
        },
        {
            $sort: {"posts.published": -1}
        },
        {
            $group: {
                _id: null,
                posts_array: {$push: "$posts"}
            }
        },
    ]);

    console.log(posts[0].posts_array)

    return res.json({
        posts: posts[0].posts_array
    });
}

async function updateAuthor(req, res){
    const login = await Login.findOne({token: req.cookies.token})
    const author = await Author.findOne({_id: login.authorId}).clone();

    if(author == undefined){ 
        console.log('Debug: Could not find author.')
        return res.sendStatus(404); 
    }

    if (author.username != req.body.data.newUsername) {
        console.log('Debug: Checking if username is taken.')
        existing_author = await Author.findOne({username: req.body.data.newUsername});
        if (existing_author) { return res.sendStatus(400); }
    }

    console.log('Debug: Found the author.');
    author.username = req.body.data.newUsername;
    author.password = crypto_js.SHA256(req.body.data.newPassword);
    author.email = req.body.data.newEmail;
    author.save();
}

module.exports={
    register_author,
    get_profile,
    getCurrentAuthor,
    getCurrentAuthorUsername,
    fetchMyPosts,
    getCurrentAuthorAccountDetails,
    updateAuthor
}
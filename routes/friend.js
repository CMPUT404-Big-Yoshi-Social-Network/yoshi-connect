const { friend_scheme, login_scheme} = require('../db_schema/author_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;
const Friend = database.model('Friend', friend_scheme);
const Login = database.model('Login', login_scheme);

async function fetchFriends(req, res) {
    let authorId = '';
    Login.findOne({token: req.body.data.sessionId}, function(err, login) {
        console.log('Debug: Retrieving current author logged in')
        authorId = login.authorId
    }).clone();

    await Friend.findOne({authorId: authorId}, function(err, friends){
        console.log("Debug: Friends exists");
        if (friends != undefined) {
            if (friends != [] && friends != null) {
                return res.json({
                    friends: friends.friends
                });
            }
        }
    }).clone()
}

async function fetchFriendPosts(req, res) {
    console.log('Debug: Getting friend posts');
    let username = '';
    await Login.find({token: req.body.data.sessionId}, function(err, login) {
        console.log('Debug: Retrieving current author logged in')
        username = login[0].username
    }).clone();

    let friends = [];
    await Friend.findOne({username: username}, function(err, friends){
        console.log("Debug: Friends exists");
        if (friends != undefined) {
            if (friends != [] && friends != null) {
                friends = friends;
            }
        }
    }).clone()

    // Refactor Later
    let friendsPosts = [];
    for (let i = 0; i < friends.length; i++) {
        await Post.findOne({username: friends[i].authorId}, function(err, post){
            if (post != []) {
                post.posts.forEach( function (obj) {
                    obj.authorId = friends[i].authorId;
                });
                friendsPosts = friendsPosts.concat(post.posts);
            }
        }).clone()
    }

    return res.json({
        friendPosts: friendsPosts
    })
}

module.exports={
    fetchFriends,
    fetchFriendPosts
}
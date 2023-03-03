const { friend_scheme, login_scheme} = require('../db_schema/author_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;
const Friend = database.model('Friend', friend_scheme);
const Login = database.model('Login', login_scheme);

async function fetchFriends(req, res) {
    let username = '';
    await Login.find({token: req.body.data.sessionId}, function(err, login) {
        console.log('Debug: Retrieving current author logged in')
        username = login[0].username
    }).clone();

    await Friend.find({username: username}, function(err, friends){
        console.log("Debug: Friends exists");
        if (friends != []) {
            return res.json({
                friends: friends[0].friends
            });
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
    await Friend.find({username: username}, function(err, friends){
        console.log("Debug: Friends exists");
        if (friends != []) {
            friends = friends[0].friends
        }
    }).clone()

    // Refactor Later
    let friendsPosts = [];
    await Post.findOne({username: friends[i].authorId}, function(err, posts){
        if (posts != []) {
            friendsPosts = friendsPosts.concat(posts.posts);
        }
    }).clone()

    return res.json({
        friendPosts: friendsPosts
    })
}

module.exports={
    fetchFriends,
    fetchFriendPosts
}
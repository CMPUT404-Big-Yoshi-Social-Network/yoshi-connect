const { Friend, Login } = require('../db_schema/author_schema.js');
const { PostHistory } = require('../db_schema/post_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

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
    if (friends != undefined) {
        for (let i = 0; i < friends.length; i++) {
            await PostHistory.findOne({authorId: friends[i].authorId}, function(err, history){
                if (history != []) {
                    history.posts.forEach( function (obj) {
                        obj.authorId = friends[i].authorId;
                    });
                    friendsPosts = friendsPosts.concat(history.posts);
                }
            }).clone()
        }
    }

    return res.json({
        friendPosts: friendsPosts
    })
}

module.exports={
    fetchFriends,
    fetchFriendPosts
}
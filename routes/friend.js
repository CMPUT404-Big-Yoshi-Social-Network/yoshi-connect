const { friend_scheme, login_scheme } = require('../db_schema/author_schema.js');
const { post_history_scheme } = require('../db_schema/post_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;
const Friend = database.model('Friend', friend_scheme);
const Login = database.model('Login', login_scheme);
const PostHistory = database.model('Posts', post_history_scheme);

async function fetchFriends(req, res) {
    let authorId = '';
    Login.findOne({token: req.body.data.sessionId}, function(err, login) {
        console.log('Debug: Retrieving current author logged in')
        authorId = login.authorId
    }).clone();

    await Friend.findOne({authorId: authorId}, function(err, friends){
        console.log("Debug: Friends exists");
        if (friends != undefined) {
            if (friends != [] && friends != null) { return res.json({ friends: friends.items }); }
        }
    }).clone()
}

async function fetchFriendPosts(req, res) {
    console.log('Debug: Getting friend posts');
    let authorId = '';
    await Login.findOne({token: req.body.data.sessionId}, function(err, login) {
        console.log('Debug: Retrieving current author logged in')
        authorId = login.authorId
    }).clone();

    let friends = [];
    await Friend.findOne({authorId: authorId}, function(err, friends){
        console.log("Debug: Friends exists");
        if (friends != undefined) {
            if (friends != [] && friends != null) { friends = friends.items; }
        }
    }).clone()

    let friendsPosts = [];
    if (friends != undefined) {
        for (let i = 0; i < friends.length; i++) {
            await PostHistory.findOne({authorId: friends[i].authorId}, function(err, history){
                history.posts.forEach( (post) => {
                    let plainPost = post.toObject();
                    plainPost.authorId = friends[i].authorId;
                    friendsPosts.push(plainPost);
                });
            }).clone()
        }
    }

    return res.json({ friendPosts: friendsPosts })
}

module.exports={
    fetchFriends,
    fetchFriendPosts
}
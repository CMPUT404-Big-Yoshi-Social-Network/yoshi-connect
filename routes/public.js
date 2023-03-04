const { following_scheme, login_scheme } = require('../db_schema/author_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;
const Following = database.model('Following', following_scheme);
const Login = database.model('Login', login_scheme);

async function fetchFollowing(req, res) {
    let username = '';
    await Login.find({token: req.body.data.sessionId}, function(err, login) {
        console.log('Debug: Retrieving current author logged in')
        username = login[0].username
    }).clone();

    await Following.findOne({username: username}, function(err, following){
        console.log("Debug: Following exists");
        if (following != [] && following != null && following != undefined) {
            return res.json({
                followings: following.followings
            });
        }
    }).clone()
}

async function fetchPublicPosts(req, res) {
    console.log('Debug: Getting public/following posts');
    let username = '';
    await Login.find({token: req.body.data.sessionId}, function(err, login) {
        console.log('Debug: Retrieving current author logged in')
        username = login[0].username
    }).clone();

    let followings = [];
    await Following.findOne({username: username}, function(err, followings){
        console.log("Debug: Followings exists");
        if (followings != [] && followings != null && followings != undefined) {
            followings = followings.followings
        }
    }).clone()

    // Refactor Later
    let publicPosts = [];
    for (let i = 0; i < followings.length; i++) {
        await Post.findOne({username: followings[i].authorId}, function(err, following){
            if (following != []) {
                publicPosts = publicPosts.concat(following.posts);
            }
        }).clone()
    }

    // TODO: Getting the PSA (Public Posts): Require to iterate through all the authors in order to get their posts array which indicates visibility

    return res.json({
        publicPosts: publicPosts
    })
}

module.exports={
    fetchFollowing,
    fetchPublicPosts
}
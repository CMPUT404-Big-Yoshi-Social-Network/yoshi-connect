const { following_scheme, login_scheme } = require('../db_schema/author_schema.js');
const { post_history_scheme } = require('../db_schema/post_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;
const Following = database.model('Following', following_scheme);
const Login = database.model('Login', login_scheme);
const PostHistory = database.model('Posts', post_history_scheme);

async function fetchFollowing(req, res) {
    let username = '';
    await Login.find({token: req.body.data.sessionId}, function(err, login) {
        console.log('Debug: Retrieving current author logged in')
        username = login[0].username
    }).clone();

    await Following.findOne({username: username}, function(err, following){
        console.log("Debug: Following exists");
        if (following != undefined) {
            if (following != [] && following != null) {
                return res.json({
                    followings: following.followings
                });
            }
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
    await Following.findOne({username: username}, function(err, following){
        console.log("Debug: Following exists");
        if (following != undefined) {
            if (following != [] && following != null) {
                followings = following.followings
            }
        }
    }).clone()

    let publicPosts = [];
    if (followings != undefined) {
        for (let i = 0; i < followings.length; i++) {
            await PostHistory.findOne({authorId: followings[i].authorId}, function(err, history){
                if (history != []) {
                    history.posts.forEach( (post) => {
                        let plainPost = post.toObject();
                        plainPost.authorId = followings[i].authorId;
                        publicPosts.push(plainPost);
                    });
                }
            }).clone()
        }
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
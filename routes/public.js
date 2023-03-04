const { following_scheme, login_scheme } = require('../db_schema/author_schema.js');
const { post_history_scheme } = require('../db_schema/post_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;
const Following = database.model('Following', following_scheme);
const Login = database.model('Login', login_scheme);
const PostHistory = database.model('Posts', post_history_scheme);

async function fetchFollowing(req, res) {
    let authorId = '';
    await Login.findOne({token: req.body.data.sessionId}, function(err, login) {
        console.log('Debug: Retrieving current author logged in')
        authorId = login.authorId
    }).clone();

    await Following.findOne({authorId: authorId}, function(err, following){
        console.log("Debug: Following exists");
        if(following == undefined){
            return res.json({ following: [] });
        }
        return res.json({ following: following.items })
    }).clone();
}

async function fetchPublicPosts(req, res) {
    console.log('Debug: Getting public/following posts');
    let authorId = '';
    await Login.findOne({token: req.body.data.sessionId}, function(err, login) {
        console.log('Debug: Retrieving current author logged in')
        authorId = login.authorId
    }).clone();

    let followings = [];
    const following = await Following.findOne({authorId: authorId}).clone()
    if (following != undefined) {
        if (following.items != [] && following.items != null) { followings = following.items }
    }

    let publicPosts = [];
    if (followings != undefined) {
        for (let i = 0; i < followings.length; i++) {
            let history = await PostHistory.findOne({authorId: followings[i].authorId});
            if (history != []) {
                history.posts.forEach( (post) => {
                    let plainPost = post.toObject();
                    plainPost.authorId = followings[i].authorId;
                    publicPosts.push(plainPost);
                });
            }
        }
    }

    // TODO: Getting the PSA (Public Posts): Require to iterate through all the authors in order to get their posts array which indicates visibility
    return res.json({ publicPosts: publicPosts });
}

module.exports={
    fetchFollowing,
    fetchPublicPosts
}
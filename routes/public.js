const { Following, Login } = require('../db_schema/author_schema.js');
const { PostHistory } = require('../db_schema/post_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;


async function fetchFollowing(req, res) {
    const login = await Login.findOne({token: req.body.data.sessionId}).clone();
    if(!login){
        return res.sendStatus(404);
    }

    console.log('Debug: Retrieving current author logged in')
    const username = login.username
    
    await Following.findOne({username: username}, function(err, following){
        console.log("Debug: Following exists");
        if(following == undefined){
            return res.json({
                following: []
            });
        }

        return res.json({
            following: following.followings
        })
    }).clone();
}

async function fetchPublicPosts(req, res) {
    console.log('Debug: Getting public/following posts');
    const login = await Login.findOne({token: req.body.data.sessionId}).clone();
    if(!login){
        return res.sendStatus(404);
    }

    console.log('Debug: Retrieving current author logged in')
    const username = login.username

    let followings = [];
    const following = await Following.findOne({username: username}).clone()
    if (following != undefined) {
        if (following.followings != [] && following.followings != null) {
            followings = following.followings
        }
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
    return res.json({
        publicPosts: publicPosts
    });
}

module.exports={
    fetchFollowing,
    fetchPublicPosts
}
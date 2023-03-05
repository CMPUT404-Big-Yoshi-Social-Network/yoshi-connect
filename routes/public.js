// Database
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

// Schemas
const { Following, Login } = require('../db_schema/author_schema.js');
const { PostHistory } = require('../db_schema/post_schema.js');

async function fetchFollowing(req, res) {
    const login = await Login.findOne({token: req.body.data.sessionId}).clone();
    if(!login){ return res.sendStatus(404); }

    console.log('Debug: Retrieving current author logged in')
    const authorId = login.authorId
    
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
    const login = await Login.findOne({token: req.body.data.sessionId}).clone();
    if(!login){ return res.sendStatus(404); }

    console.log('Debug: Retrieving current author logged in')
    const authorId = login.authorId

    /*
    let followings = [];
    const following = await Following.findOne({authorId: authorId}, 'items').clone()
    if (following != undefined) {
        if (following.items != [] && following.items != null) { followings = following.items }
    }
    */

    const following = await Following.aggregate([
        {
            $match: {'username': username} 
        },
        {
            $unwind: '$items'
        },
        {
            $project: {
                "items.authorId": 1
            }
        },
        {
            $group: {
                _id: null,
                items: { $addToSet: "$items.authorId"}
            }
        },
    ]);

    let followings = undefined
    if(following.length > 0){
        followings = following[0].items;
    }
    
    if (followings == undefined) { return res.sendStatus(404); }

    const posts = await PostHistory.aggregate([
        {
            $match: {
                $expr: {
                    $in : ["$authorId", followings]
                }
            },
        },
        {
            $unwind: "$posts"
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
            $sort: {"posts.published": -1}
        },
        {
            $group: {
                _id: null,
                posts_array: {$push: "$posts"}
            }
        },
    ]);
    
    /*
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
    */

    // TODO: Getting the PSA (Public Posts): Require to iterate through all the authors in order to get their posts array which indicates visibility
    return res.json({
        publicPosts: []
    });
}

module.exports={
    fetchFollowing,
    fetchPublicPosts
}
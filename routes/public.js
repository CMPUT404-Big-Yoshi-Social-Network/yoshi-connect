const { Following, Login } = require('../db_schema/author_schema.js');
const { PostHistory, PublicPost } = require('../db_schema/post_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);


async function fetchFollowing(req, res) {
    const login = await Login.findOne({token: req.cookies.token}).clone();
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
    const login = await Login.findOne({token: req.cookies.token}).clone();
    if(!login){
        return res.sendStatus(404);
    }

    console.log('Debug: Retrieving current author logged in')
    const username = login.username

    const following = await Following.aggregate([
        {
            $match: {'username': username} 
        },
        {
            $unwind: '$followings'
        },
        {
            $project: {
                "followings.authorId": 1
            }
        },
        {
            $group: {
                _id: null,
                follows: { $addToSet: "$followings.authorId"}
            }
        },
    ]);

    let followings = [];
    if(following.length > 0){
        followings = following[0].follows;
    }

    
    if(followings.length == 0){
        return res.json({
            publicPosts: []
        });
    }

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
            $match: {
                $expr: {
                    $ne: ["$unlisted", true]
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

    const publicPosts = await PublicPost.aggregate([
        { $match: {} },
        {
            $unwind: "$posts"
        },
        {
            $match: {
                $expr: {
                    $ne: ["$posts.post.unlisted", true]
                }
            }
        },
        {
            $set: {
                "posts.post.published": {
                    $dateFromString: {
                        dateString: "$posts.post.published"
                    }
                }
            }
        },
        {
            $addFields: {
                "posts.post.authorId": "$posts.authorId"
            }
        },
        {
            $sort: {"posts.post.published": -1}
        },
        {
            $group: {
                _id: null,
                publicPosts: {$push: "$posts"}
            }
        }  
    ]);
    const allPosts = posts[0].posts_array.concat(publicPosts[0].publicPosts);

    if (allPosts){
        return res.json({
            publicPosts: allPosts
        });
    }
}

module.exports={
    fetchFollowing,
    fetchPublicPosts
}

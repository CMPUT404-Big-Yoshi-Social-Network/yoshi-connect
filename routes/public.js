/*
Copyright 2023 Kezziah Camille Ayuno, Alinn Martinez, Tommy Sandanasamy, Allan Ma, Omar Niazie

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.


Furthermore it is derived from the Python documentation examples thus
some of the code is Copyright © 2001-2013 Python Software
Foundation; All Rights Reserved
*/

const { Following, Login } = require('../db_schema/author_schema.js');
const { PostHistory, PublicPost } = require('../db_schema/post_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

// Schemas
const { Following, Login } = require('../db_schema/authorScheme.js');
const { PostHistory, PublicPost } = require('../db_schema/postScheme.js');

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

    let posts = [[]];
    if(followings.length != 0){
        posts = await PostHistory.aggregate([
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
    }

    let publicPosts = await PublicPost.aggregate([
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
                publicPosts: {$push: "$posts.post"}
            }
        }  
    ]);

    if(publicPosts.length == 0)
        return res.json({
            publicPosts: []
        })

    let allPosts = null;
    if (publicPosts[0] != undefined && posts[0] != undefined && posts[0].length != 0) {
        allPosts = posts[0].posts_array.concat(publicPosts[0].publicPosts);
    } else if (posts[0] != undefined) {
        allPosts = posts[0].posts_array;
    } else if (publicPosts[0] != undefined) {
        allPosts = publicPosts[0].publicPosts;
    } else {
        allPosts = [];
    }

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

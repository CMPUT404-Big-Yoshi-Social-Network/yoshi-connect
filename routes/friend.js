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

const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

// Schemas
const { Friend, Login, Follower } = require('../db_schema/authorScheme.js');
const { PostHistory } = require('../db_schema/postScheme.js');
const { senderAdded } = require('./request.js');
const {authLogin} = require('../auth.js')
async function fetchFriends(req, res) {
    const login = await Login.findOne({token: req.cookies.token}).clone();
    if(!login){
        return res.sendStatus(404);
    }

    const username = login.username;
    await Friend.findOne({username: username}, function(err, friends){
        console.log("Debug: Friends exists");
        if(friends == undefined){
            return res.json({
                friends: []
            });
        }

        return res.json({
            friends: friends.friends
        })
    }).clone();
}

async function fetchFriendPosts(req, res) {
    console.log('Debug: Getting friends posts');
    const login = await Login.findOne({token: req.cookies.token}).clone();
    if (!login) { return res.sendStatus(404); }

    console.log('Debug: Retrieving current author logged in')
    const username = login.username
    const friend = await Friend.aggregate([
        {
            $match: {'username': username} 
        },
        {
            $unwind: '$friends'
        },
        {
            $project: {
                "friends.authorId": 1
            }
        },
        {
            $group: {
                _id: null,
                friends: { $addToSet: "$friends.authorId"}
            }
        },
    ]);

    let friends = [];
    if(friend.length > 0){
        friends = friend[0].friends;
    }
    
    if(friends.length == 0){
        return res.json({
            friendPosts: []
        });
    }

    // TODO: EXCLUDE UNLISTED ITEMS (WHEN UNLISTED==TRUE)
    const posts = await PostHistory.aggregate([
        {
            $match: {
                $expr: {
                    $in : ["$authorId", friends]
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

    return res.json({
        friendPosts: posts[0].posts_array
    });
}

/**
 * API STUFF
 */

async function getFollowers(id){
    const followers = await Follower.findOne({authorId: id});

    if(!followers)
        return 404;
        
    return followers.followers;
}

async function getFriends(id){
    const friends = await Friend.findOne({authorId: id});

    if(!friends)
        return 404;

    return friends.friends;
}

async function addFollower(token, authorId, foreignId, body, req, res){
    if(!authLogin(token, authorId))
        return 401;

    if(body.object == undefined || body.actor == undefined)
        return 400;

    if(body.object.id != authorId){
        return 400;
    }
    if(body.actor.id != foreignId){
        return 400;
    }

    const request = await Request.findOne({senderUUID: foreignId, receiverUUID: authorId});
    if(!request){
        return 401;
    }

    senderAdded(req, res);
    return;
}
module.exports={
    fetchFriends,
    fetchFriendPosts,
    getFollowers,
    getFriends,
    addFollower
}
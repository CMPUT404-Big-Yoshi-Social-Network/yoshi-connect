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

// Database 
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

// Schemas
const { Follower, Following, Request } = require('../scheme/relations.js');
const { PostHistory, Inbox } = require('../scheme/post.js');

// Additional Functions
const { senderAdded } = require('./request.js');

// Additional Functions
const {authLogin} = require('./auth.js');

async function getFollowers(id){
    /**
    Description: Gets a specific Author using foreignAuthorId params associated by authorId params 
    Associated Endpoint: /authors/:authorId/followers/:foreignAuthorId
    Request Type: GET 
    Request Body: { authorId: 29c546d45f564a27871838825e3dbecb }
    Return: 404 Status (Not Found) -- Follower associated with Author was not found
    */
    const followers = await Follower.findOne({authorId: id});
    if (!followers) { return 404; }
    return followers.followers;
}

async function getFollowings(id){
    /**
    Description: Gets the followings list for Author associated with authorId
    Associated Endpoint: /authors/:authorId/followings
    Request Type: GET
    Request Body: { authorId: 29c546d45f564a27871838825e3dbecb }
    Return: 404 Status (Not Found) -- Author associated with authorId does not have a followings list 
    */
    const following = await Following.findOne({authorId: id});
    if (!following) { return 404; }
    return following.followings;
}

async function getFriends(id){
    /**
    Description: Gets friends list associated with authorId
    Associated Endpoint: /authors/:authorId/friends
    Request Type: GET
    Request Body: N/A
    Return: 200 Status (OK) -- Returns array of Friends
    */
    const following = await Following.aggregate([
        {
            $match: {'authorId': id} 
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
    if(following.length > 0){ followings = following[0].follows; }
    const friends = await Following.aggregate([
        {
            $match: {
                $expr: {
                    $in : ["$authorId", followings]
                }
            },
        },
        {
            $unwind: "$followings"
        },
        {
            $match: {'followings.authorId': id} 
        },
        {
            $group: {
                _id: null,
                friends: {$push: "$authorId"}
            }
        }
    ]);

    if (friends[0] == undefined) {
        return []
    } else {
        return friends[0].friends
    }
}

async function addFollower(token, authorId, foreignId, body, req, res){
    /**
    Description: Adds a new follower associated with foreignAuthorId for the Author associated with authorId
    Associated Endpoint: /authors/:authorId/followers/:foreignAuthorId
    Request Type: POST
    Request Body: { authorId: 29c546d45f564a27871838825e3dbecb }
    Return: 404 Status (Not Found) -- Unable to find a request object from the foreignAuthorId to the authorId
    */
    const inbox = await Inbox.findOne({authorId: foreignId}, '_id requests');
    let idx = inbox.requests.map(obj => obj.actorId).indexOf(authorId);
    if (idx <= -1) { return 404; } 

    await senderAdded(authorId, foreignId, req, res);
}

async function deleteFollowing(authorId, foreignId){
    /**
    Description: Deletes a specific Author associated with foreignAuthorId contained in Author followings list associated with authorIdi
    Associated Endpoint: /authors/:authorId/followings/:foreignAuthorId
    Request Type: DELETE
    Request Body: { authorId: 29c546d45f564a27871838825e3dbecb })
    Return: 204 Status (No Content) -- Following foreign Author was deleted from followings list associated with authorId
    */
    const followings = await Following.findOne({authorId: authorId});
    for(let i = 0; i < followings.followings.length; i++){
        let follow = followings.followings[i];

        if(follow.authorId == foreignId){
            followings.followings[i].remove();
            await followings.save();
            break
        }
    }
    return 204;
}

async function isFriend(authorId, foreignId, res) {
    /**
    Description: Checks if the Author associated with foreignId is true friends with Author associated with authorId
    Associated Endpoint: /authors/:authorId/friends/:foreignId
    Request Type: POST
    Request Body: { authorId: 29c546d45f564a27871838825e3dbecb }
    Return: 200 Status (OK) -- Returns JSON with 
                                    { type: "relation",
                                        "aId" : https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb,
                                        "actorId" : authorId,
                                        "host": https://yoshi-connect.herokuapp.com/,
                                        "oId" : https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb,
                                        "objectId" : 29c546d45f564a27871838825e3dbecb,
                                        status: 'Follows' }
    */
    let actorFollows = false;
    let objectFollows = false;
    const followerA = await Following.findOne({authorId: authorId}, {followings: {$elemMatch: {authorId : {$eq: foreignId}}}});
    if (followerA.followings.length != 0) { actorFollows = true; }
    const followerB = await Following.findOne({authorId: foreignId}, {followings: {$elemMatch: {authorId : {$eq: authorId}}}});
    if (followerB.followings.length != 0) { objectFollows = true; }
    if (actorFollows && objectFollows) {
        return res.json({
            type: "relation",
            "aId" : process.env.DOMAIN_NAME + "authors/" + authorId,
            "actorId" : authorId,
            "host": process.env.DOMAIN_NAME,
            "oId" : process.env.DOMAIN_NAME + "authors/" + foreignId,
            "objectId" : foreignId,
            status: 'Friends'
        }) 
    } else {
        if (actorFollows && !objectFollows) {
            return res.json({
                type: "relation",
                "aId" : process.env.DOMAIN_NAME + "authors/" + authorId,
                "actorId" : authorId,
                "host": process.env.DOMAIN_NAME,
                "oId" : process.env.DOMAIN_NAME + "authors/" + foreignId,
                "objectId" : foreignId,
                status: 'Follows'
            })  
        } else if (!actorFollows) {
            return res.json({
                type: "relation",
                "aId" : process.env.DOMAIN_NAME + "authors/" + authorId,
                "actorId" : authorId,
                "host": process.env.DOMAIN_NAME,
                "oId" : process.env.DOMAIN_NAME + "authors/" + foreignId,
                "objectId" : foreignId,
                status: 'Strangers'
            })  
        }
    }
}

async function fetchFriendPosts(req, res) {
    /**
    Description: 
    Associated Endpoint: (for example: /authors/:authorid)
    Request Type: 
    Request Body: (for example: { username: kc, email: 123@aulenrta.ca })
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
    */
    const friends = await getFriends(req.params.authorId);

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

    if (posts[0] == undefined) {
        return res.json({
            type: "posts",
            items: []
        })        
    } else {
        return res.json({
            type: "posts",
            items: posts[0].posts_array
        })
    }
}

module.exports={
    fetchFriendPosts,
    getFollowers,
    getFollowings,
    addFollower,
    deleteFollowing,
    getFriends,
    addFollower,
    isFriend
}
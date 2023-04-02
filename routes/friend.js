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
const { OutgoingCredentials } = require('../scheme/server.js');
const axios = require('axios');

async function getFollowers(id){
    /**
    Description: 
    Associated Endpoint: (for example: /authors/:authorid)
    Request Type: 
    Request Body: (for example: { username: kc, email: 123@aulenrta.ca })
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
    */
    const followers = await Follower.findOne({authorId: id});
    if (!followers) { return 404; }
    return followers.followers;
}

async function getFollowings(id){
    /**
    Description: 
    Associated Endpoint: (for example: /authors/:authorid)
    Request Type: 
    Request Body: (for example: { username: kc, email: 123@aulenrta.ca })
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
    */
    const following = await Following.findOne({authorId: id});
    if (!following) { return 404; }
    return following.followings;
}

async function getFriends(id){
    /**
    Description: 
    Associated Endpoint: (for example: /authors/:authorid)
    Request Type: 
    Request Body: (for example: { username: kc, email: 123@aulenrta.ca })
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
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
    Description: 
    Associated Endpoint: (for example: /authors/:authorid)
    Request Type: 
    Request Body: (for example: { username: kc, email: 123@aulenrta.ca })
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
    */
    const inbox = await Inbox.findOne({authorId: foreignId}, '_id requests');
    let idx = inbox.requests.map(obj => obj.actorId).indexOf(authorId);
    if (idx <= -1) { return 404; } 

    await senderAdded(authorId, foreignId, req, res);
}

async function deleteFollowing(authorId, foreignId){
    /**
    Description: 
    Associated Endpoint: (for example: /authors/:authorid)
    Request Type: 
    Request Body: (for example: { username: kc, email: 123@aulenrta.ca })
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
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

async function deleteFollower(authorId, foreignId){
    /**
    Description: 
    Associated Endpoint: (for example: /authors/:authorid)
    Request Type: 
    Request Body: (for example: { username: kc, email: 123@aulenrta.ca })
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
    */
    const followers = await Follower.findOne({authorId: authorId});
    for(let i = 0; i < followers.followers.length; i++){
        let follow = followers.followers[i];

        if(follow.authorId == foreignId){
            followers.followers[i].remove();
            await followers.save();
            break
        }
    }
    return 204;
}

async function isFriend(isLocal, authorId, foreignId, res) {
    /**
    Description: 
    Associated Endpoint: (for example: /authors/:authorid)
    Request Type: 
    Request Body: (for example: { username: kc, email: 123@aulenrta.ca })
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
    */
    let actorFollows = false;
    let objectFollows = false;

    // Checking if the foreign author is a follower of author
    const followerA = await Follower.findOne({authorId: authorId}, {followers: {$elemMatch: {authorId : {$eq: foreignId}}}});
    if (followerA.followers.length != 0) { actorFollows = true; }

    // Checking if the author is a follower of foreign author (remote / local)
    if (isLocal) {
        const followerB = await Follower.findOne({authorId: foreignId}, {followers: {$elemMatch: {authorId : {$eq: authorId}}}});
        if (followerB.followers.length != 0) { objectFollows = true; }
    } else {
        const outgoings = await OutgoingCredentials.find().clone();
    
        let followers = [];
        let found = false;
    
        for (let i = 0; i < outgoings.length; i++) {
            if (outgoings[i].allowed) {
                const auth = outgoings[i].auth
                if (outgoings[i].url === 'https://bigger-yoshi.herokuapp.com/api') {
                    var config = {
                        host: outgoings[i].url,
                        url: outgoings[i].url + '/authors' + foreignId + '/followers/',
                        method: 'GET',
                        headers: {
                            'Authorization': auth,
                            'Content-Type': 'application/json'
                        }
                    };              
                } else {
                    var config = {
                        host: outgoings[i].url,
                        url: outgoings[i].url + '/authors' + foreignId + '/followers',
                        method: 'GET',
                        headers: {
                            'Authorization': auth,
                            'Content-Type': 'application/json'
                        }
                    };
                }
                await axios.request(config)
                .then( res => {
                    if (!res.data && !found) {
                        let items = res.data.items
                        followers = items;  
                        found = true;              
                    }
                })
                .catch( error => {
                    if (error.response.status == 404) {
                        console.log('Debug: This is not the correct server that has this Author follower list.')
                    }
                })   
            } 
        }
        if (found) {
            let idx = followers.map(obj => obj.id.split('/')[(obj.id.split('/')).length - 1]).indexOf(authorId);
            if (idx > -1) { 
                objectFollows = true
            } else {
                objectFollows = false
            }
        }
    }
    if (actorFollows && objectFollows) {
        return res.json({
            status: 'Friends'
        }) 
    } else {
        if (!actorFollows && objectFollows) {
            return res.json({
                status: 'Follows'
            })  
        } else if (!objectFollows) {
            return res.json({
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
    isFriend,
    deleteFollower
}
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
const { Friend, Login, Follower } = require('../dbSchema/authorScheme.js');
const { PostHistory } = require('../dbSchema/postScheme.js');
const { senderAdded } = require('./request.js');
const {authLogin} = require('./auth.js')
async function fetchFriends(req, res) {
    /**
     * Desciption: Fetches the friends of a specified author from the database
     * Returns: Status 404 if there is no associated token with a login document 
     *          Either returns the list of friends or an empty list of friends if the author has no friends
     */
    const login = await Login.findOne({token: req.cookies.token}).clone();
    if (!login) { return res.sendStatus(404); }

    const username = login.username;
    await Friend.findOne({username: username}, function(err, friends){
        console.log("Debug: Friends exists");
        if (friends == undefined) { return res.json({ friends: [] }); }
        return res.json({ friends: friends.friends })
    }).clone();
}

async function fetchFriendPosts(req, res) {
    /**
     * Description: Fetches the posts of friends of the author 
     *              Aggregates with $match, $unwind, $project, and $group in order to collect all friends 
     *              Aggregates with $match (by authorId), $unwind, $match (to get only listed posts), $set, 
     *              $addFields (couples post to authorId), $sort (by publishing date), and $group in order 
     *              to collect all the friends' posts
     * Returns: Status 404 if there is no associated token in the login collection
     *          If the author has no friends, it will return an empty array 
     *          If successful, it will return the posts 
     */
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
            $project: { "friends.authorId": 1 }
        },
        {
            $group: {
                _id: null,
                friends: { $addToSet: "$friends.authorId"}
            }
        },
    ]);

    let friends = [];
    if (friend.length > 0) { 
        friends = friend[0].friends; 
    } else { 
        return res.json({ friendPosts: [] }); 
    }

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
            $addFields: { "posts.authorId": "$authorId" }
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

    return res.json({ friendPosts: posts[0].posts_array });
}

/**
 * API STUFF
 */

async function getFollowers(id){
    /**
     * Description: Gets all the follows of an author
     * Returns: Status 404 if there are no existing followers
     *          If successful, returns a list of followers
     */
    const followers = await Follower.findOne({authorId: id});
    if (!followers) { return 404; }
    return followers.followers;
}

async function getFriends(id){
    /**
     * Description: Gets all the friends of an author
     * Returns: Status 404 if there are no existing friends
     *          If successful, returns a list of friends
     */
    const friends = await Friend.findOne({authorId: id});
    if (!friends) { return 404; }
    return friends.friends;
}

async function addFollower(token, authorId, foreignId, body, req, res){
    if(!authLogin(token, authorId))
        return 401;

    req.body.data = {};
    req.body.data.sender = body.actor.displayName;
    req.body.data.receiver = body.object.displayName;
    if(body.object == undefined || body.actor == undefined)
        return 400;

    const request = await Request.findOne({senderUUID: foreignId, receiverUUID: authorId});
    if(!request){
        return 401;
    }

    await senderAdded(req, res);
    return;
}

async function deleteFollower(token, authorId, foreignId, body){
    if(!authLogin(token, authorId))
        return 401;

    //If true friends remove from friends and add an entry for following and follers
    //If following/friends remove from following and follwers

    let relation = "friend"

    const friends = await Friend.findOne({authorId: authorId});
    if(!friends)
        relation = "follower"

    if(relation == "friend"){
        const foreignFriends = await Friend.findOne({authorId: foreignId});

        for(let i = 0; i < friends.friends.length; i++){
            let friend = friends.friends[i];

            if(friend.authorId == foreignId){
                friends.friends.id(friend._id).remove();
                await friends.save();
            }
        }

        for(let i = 0; i < foreignFriends.friends.length; i++){
            let friend = foreignFriends.friends[i];

            if(friend.authorId == authorId){
                foreignFriends.friends.id(friend._id).remove();
                await foreignFriends.save()
            }
        }

        //Add foreign to author following
        //Add author to foreign follower

        authorFollowings = await Following.findOne({authorId: authorId});
        foreignFollowers = await Follower.findOne({authorId: foreignId});

        if(authorFollowings){
            authorFollowings.followings.push({
                username: body.actor.displayName, 
                authorId: foreignId
            });
            await authorFollowings.save();
        }
        else{
            var following = new Following({
                authorId: body.object.displayName,
                username: authorId,
                followings: [{
                    username: body.actor.displayName,
                    authorId: foreignId
                }]
            });
    
            
            await following.save(async (err, follower, next) => {
                if (err) { success = false; }
            })
            
        }

        if(foreignFollowers){
            foreignFollowers.followers.push({
                username: body.object.displayName, 
                authorId: authorId
            });
            await foreignFollowers.save();
        }
        else{
            var followers = new Follower({
                authorId: body.actor.displayName,
                username: foreignId,
                followers: [{
                    username: body.object.displayName,
                    authorId: authorId
                }]
            });
    
            await followers.save(async (err, follower, next) => {
                if (err) { success = false; }
            })
        }
    }

    if(relation == "follower"){
        //remove foreignauthor from author follower and remove author from foreignauthor following
        const authorFollowers = await Follower.findOne({authorId: authorId});

        for(let i = 0; i < authorFollowers.followers.length; i++){
            follower = authorFollowers.followers[i];

            if(follower.authorId == foreignId){
                authorFollowers.followers._id(follower._id).remove();
            }
        }

        const foreignFollowing = await Following.findOne({authorId: foreignId});

        for(let i = 0; i < foreignFollowing.followings.length; i++){
            following = foreignFollowing.followings[i];

            if(followings.authorId == authorId){
                foreignFollowing.followings._id(following._id).remove();
            }
        }
    }

    return 200;
}

module.exports={
    fetchFriends,
    fetchFriendPosts,
    getFollowers,
    getFriends,
    addFollower,
    deleteFollower
}
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
const { Follower, Friend, Following, Request } = require('../scheme/relations.js');
const { PostHistory } = require('../scheme/post.js');

// Additional Functions
const { senderAdded } = require('./request.js');

// Additional Functions
const {authLogin} = require('./auth.js');

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

async function getFollowings(id){
    const following = await Following.findOne({authorId: id});
    if (!following) { return 404; }
    return following.followings;
}

async function getFriends(id){
    // TODO: Write this query
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

    return friends[0].friends
}

async function addFollower(token, authorId, foreignId, body, req, res){
    if(!authLogin(token, authorId)) return 401;

    const request = await Request.findOne({actorId: authorId, objectId: foreignId});
    if (!request) { return 401; }

    await senderAdded(authorId, foreignId, req, res);
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

async function isFriend(authorId, foreignId, res) {
    //TODO CHECK IF FRIEND
    //get followers for authorId
    //get following for authorId
    //check if both are real
    let actorFollows = false;
    let objectFollows = false;
    const followerA = await Following.findOne({authorId: authorId}, {followings: {$elemMatch: {authorId : {$eq: foreignId}}}});
    if (followerA.followings !== []) { objectFollows = true; }
    const followerB = await Following.findOne({authorId: foreignId}, {followings: {$elemMatch: {authorId : {$eq: authorId}}}});
    if (followerB.followings !== []) { actorFollows = true; }
    if (actorFollows && objectFollows) {
        return res.json({
            status: 'Friends'
        }) 
    } else {
        if (actorFollows && !objectFollows) {
            return res.json({
                status: 'Follows'
            })  
        } else if (!actorFollows) {
            return res.json({
                status: 'Strangers'
            })  
        }
    }
}

async function fetchFriendPosts(req, res) {
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

    return res.json({
        items: posts[0].posts_array
    })
}

module.exports={
    fetchFriendPosts,
    getFollowers,
    getFollowings,
    addFollower,
    deleteFollower,
    getFriends,
    addFollower,
    deleteFollower,
    isFriend
}
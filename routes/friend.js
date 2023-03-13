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
const { Follower, Friend, Following } = require('../scheme/relations.js');

// Additional Functions
const { senderAdded } = require('./request.js');

// Additional Functions
const {authLogin} = require('./auth.js')

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

async function isFriend(authorId, foreignId, res) {
    //TODO CHECK IF FRIEND
    //get followers for authorId
    //get following for authorId
    //check if both are real
    let actorFollows = false;
    let objectFollows = false;
    follower = await Follower.findOne({authorId: authorId}, {followers: {$elemMatch: {authorId : {$eq: foreignId}}}});
    if (follower) { objectFollows = true; }
    following = await Following.findOne({authorId: authorId}, {following: {$elemMatch: {authorId : {$eq: foreignId}}}});
    if (following) { actorFollows = true; }
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
    //TODO GET FRIEND POSTS
    return res.sendStatus(404); // TEMPORARY

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
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

// Fetching database 
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;

// Fetching schemas
const { followerScheme, followingScheme, friendScheme } = require('../db_schema/authorSchema.js');
const Follower = database.model('Follower', followerScheme);
const Following = database.model('Following', followingScheme);
const Friend = database.model('Friend', friendScheme);

async function isFriend(req, res) {
    console.log('Debug: Checking if the author is a friend or follow.');

    checkFriend = false;
    let status = '';

    await Following.findOne({username: req.body.data.viewer}, function(err, following){
        console.log('Debug: See if viewer is viewing someone they follow.')
        if (following) {
            console.log('Debug: This viewer does follow people, but do they follow the viewed.')
            let idx = following.followings.map(obj => obj.username).indexOf(req.body.data.viewed);
            if (idx > -1) { 
                console.log('Debug: They follow them (false).')
                status = false;
            } else {
                checkFriend = true;
            }
        } else {
            checkFriend = true;
        }
    }).clone()

    if (checkFriend) {
        await Friend.findOne({username: req.body.data.viewer}, function(err, friend){
            console.log('Debug: See if viewer is viewing someone they friended.')
            if (friend) {
                console.log('Debug: This viewer does friend people, but do they friend the viewed.')
                let idx = friend.friends.map(obj => obj.username).indexOf(req.body.data.viewed);
                if (idx > -1) { 
                    console.log('Debug: They are friends (true).')
                    status = true;
                } 
            } 
        }).clone()
    }
    return res.json({
        status: status
    });
}

async function unfriending(req, res) {
    console.log('Debug: Viewer is unfriending the viewed.')

    let success = true;

    let newFriendSender = [];
    await Friend.findOne({username: req.body.data.sender}, function(err, friend){
        console.log('Debug: Remove receiver from sender friend list.')
        if (friend) {
            console.log('Debug: We found sender friend list, now we need to delete receiver.')
            newFriendSender = friend.friends;
            let idx = friend.friends.map(obj => obj.username).indexOf(req.body.data.receiver);
            if (idx > -1) { 
                friend.friends.splice(idx, 1);
                newFriendSender = friend.friends;
            }                
        } 
    }).clone()
    await Friend.findOneAndReplace({username: req.body.data.sender}, {username: req.body.data.sender, friends: newFriendSender}).clone()

    let newFriendReceiver = [];
    await Friend.findOne({username: req.body.data.receiver}, function(err, friend){
        console.log('Debug: Remove sender from receiver friend list.')
        if (friend) {
            console.log('Debug: We found receiver friend list, now we need to delete sender.')
            newFriendReceiver = friend.friends;
            let idx = friend.friends.map(obj => obj.username).indexOf(req.body.data.sender);
            if (idx > -1) { 
                friend.friends.splice(idx, 1);
                newFriendReceiver = friend.friends;
            }                
        } 
    }).clone()
    await Friend.findOneAndReplace({username: req.body.data.receiver}, {username: req.body.data.receiver, friends: newFriendReceiver}).clone()

    let newFollowing = [];
    await Following.findOne({username: req.body.data.receiver}, function(err, following){
        console.log('Debug: Add sender to receiver following list.')
        if (following) {
            console.log('Debug: Receiver already has a following list, must add to existing list.')
            following.followings.push({username: req.body.data.sender});
            newFollowing = following.followings;
        } else {
            console.log('Debug: Receiver does not have a following list (has not followed anyone), must make one.')
            var following = new Following({
                username: req.body.data.receiver,
                followings: [{
                    username: req.body.data.sender,
                }]
            });

            following.save(async (err, following, next) => {
                if (err) {
                    success = false;
                }
            })
        }
    }).clone()
    if (newFollowing.length) {
        console.log('Debug: New following.')
        await Following.findOneAndReplace({username: req.body.data.receiver}, {username: req.body.data.receiver, followings: newFollowing}).clone()
    }

    let newFollower = [];
    await Follower.findOne({username: req.body.data.sender}, function(err, follower){
        console.log('Debug: Add receiver to sender follower list.')
        if (follower) {
            console.log('Debug: Sender already has a follower list, must add to existing list.')
            follower.followers.push({username: req.body.data.receiver});
            newFollower = follower.followers;
        } else {
            console.log('Debug: Sender does not have a follower list (has no followers), must make one.')
            var follower = new Follower({
                username: req.body.data.sender,
                followers: [{
                    username: req.body.data.receiver,
                }]
            });

            follower.save(async (err, follower, next) => {
                if (err) {
                    success = false;
                }
            })
        }
    }).clone()
    if (newFollower.length) {
        console.log('Debug: New follower.')
        await Follower.findOneAndReplace({username: req.body.data.sender}, {username: req.body.data.sender, followers: newFollower}).clone()
    }

    return res.json({
        status: success
    });
}

async function unfollowing(req, res) {
    console.log('Debug: Viewer is unfollowing the viewed.')

    let success = true;

    let newFollowing = [];
    await Following.findOne({username: req.body.data.sender}, function(err, following){
        console.log('Debug: Remove viewed to viewer following list.')
        if (err) { 
            success = false;
        }
        if (following) {
            newFollowing = following.followings;
            let idx = following.followings.map(obj => obj.username).indexOf(req.body.data.receiver);
            if (idx > -1) { 
                following.followings.splice(idx, 1);
                newFollowing = following.followings;
            } 
        } 
    }).clone()
    await Following.findOneAndReplace({username: req.body.data.sender}, {username: req.body.data.sender, followings: newFollowing}).clone()

    let newFollower = [];
    await Follower.findOne({username: req.body.data.receiver}, function(err, follower){
        console.log('Debug: Remove viewer to viewed follower list.')
        if (err) { 
            success = false;
        }
        if (follower) {
            newFollower = follower.followers;
            let idx = follower.followers.map(obj => obj.username).indexOf(req.body.data.sender);
            if (idx > -1) { 
                follower.followers.splice(idx, 1);
                newFollower = follower.followers;
            }
        } 
    }).clone()
    await Follower.findOneAndReplace({username: req.body.data.receiver}, {username: req.body.data.receiver, followers: newFollower}).clone()

    return res.json({
        status: success
    });
}

module.exports={
    isFriend,
    unfriending,
    unfollowing
}
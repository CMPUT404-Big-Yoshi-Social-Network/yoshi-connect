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
const { requestScheme, followerScheme, followingScheme, friendScheme } = require('../db_schema/authorSchema.js');
const Request = database.model('Request', requestScheme);
const Follower = database.model('Follower', followerScheme);
const Following = database.model('Following', followingScheme);
const Friend = database.model('Friend', friendScheme);

async function saveRequest(req, res) {
    console.log('Debug: Saving the request.')
    var request = new Request({
        senderId: req.body.data.sender,
        receiverId: req.body.data.receiver,
        status: 'Stranger'
    });

    request.save(async (err, author, next) => {
        if (err) {
            return res.json({
                status: false
            });
        } else {
            return res.json({
                status: true
            });
        }
    });
}

async function deleteRequest(req, res) {
    console.log('Debug: Deleting request.')

    let sender = null;
    let receiver = null;
    if (req.body.sender === undefined) {
        sender = req.body.data.sender;
        receiver = req.body.data.receiver;
    } else {
        sender = req.body.sender;
        receiver = req.body.receiver;
    }

    await Request.deleteOne({sendId: sender, receiverId: receiver}, function(err, request) {
        if (request) {
            console.log("Debug: Request does exist and was deleted.");
            return res.json({
                status: true
            });
        } else {
            return res.json({
                status: false
            });
        }
    }).clone()
}

async function findRequest(req, res) {
    console.log('Debug: Finding specific request.');

    await Request.findOne({sendId: req.body.data.sender, receiverId: req.body.data.receiver}, function(err, request) {
        if (request) {
            console.log("Debug: Request does exist.");
            return res.json({
                status: true
            });
        } else {
            return res.json({
                status: false
            });
        }
    }).clone()
}

async function findAllRequests(req, res) {
    console.log('Debug: Finding all requests.')
    await Request.find({receiverId: req.body.data.receiver}, function(err, requests) {
        console.log("Debug: Requests exists.");
        return res.json({
            requests: requests
        });
    }).clone()
}

async function senderAdded(req, res) {
    console.log('Debug: Need to check if the receiver is already following the sender.')

    let friend = false; 
    let success = null;

    await Following.findOne({username: req.body.data.receiver}, function(err, following) {
        if (following) {
            console.log("Debug: Receiver has a following list. Now, we need to find the sender in their following list.");
            let idx = following.followings.map(obj => obj.username).indexOf(req.body.data.sender);
            if (idx > -1) { 
                friend = true;
            }
        } 

        if (!friend) {
            success = addAsFollow(req);
        } else {
            success = addAsFriend(req);
        }
    }).clone()

    if (success) {
        console.log('Debug: Delete the request since it has been accepted.')
        await deleteRequest(req, res);
    } else {
        return res.json({
            status: false
        });
    }
}

async function addAsFollow(req) {
    console.log('Debug: Added as a follower.')

    let success = true;

    console.log('Debug: Add receiver to sender following list.')
    let newFollowing = [];
    await Following.findOne({username: req.body.data.sender}, function(err, following) {
        if (following) {
            console.log('Debug: Sender already has a following list, must add to existing list.')
            following.followings.push({username: req.body.data.receiver});
            newFollowing = following.followings;
        } else {
            console.log('Debug: Sender does not have a following list (has not followed anyone), must make one.')
            var following = new Following({
                username: req.body.data.sender,
                followings: [{
                    username: req.body.data.receiver,
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
        await Following.findOneAndReplace({username: req.body.data.sender}, {username: req.body.data.sender, followings: newFollowing}).clone()
    }

    console.log('Debug: Add sender to follower list.')
    let newFollower = [];
    await Follower.findOne({username: req.body.data.receiver}, function(err, follower) {
        if (follower) {
            console.log('Debug: Receiver already has a follower list, must add to existing list.')
            follower.followers.push({username: req.body.data.sender});
            newFollower = follower.followers;
        } else {
            console.log('Debug: Receiver does not have a follower list (has no followers), must make one.')
            var follower = new Follower({
                username: req.body.data.receiver,
                followers: [{
                    username: req.body.data.sender,
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
        await Follower.findOneAndReplace({username: req.body.data.receiver}, {username: req.body.data.receiver, followers: newFollower}).clone()
    }

    return success;
}

async function removeFromFollow(req) {
    console.log('Debug: Remove sender from receiver following list.')
    let newFollowing = [];
    await Following.findOne({username: req.body.data.receiver}, function(err, following) {
        if (following) {
            let idx = following.followings.map(obj => obj.username).indexOf(req.body.data.sender);
            if (idx > -1) { 
                following.followings.splice(idx, 1);
                newFollowing = following.followings;
            }
        }
    }).clone()
    await Following.findOneAndReplace({username: req.body.data.receiver}, {username: req.body.data.receiver, followings: newFollowing}).clone()

    console.log('Debug: Remove receiver from sender follower list.')
    let newFollower = [];
    await Follower.findOne({username: req.body.data.sender}, function(err, follower) {
        if (follower) {
            console.log('Debug: We found sender follower list, now we need to delete receiver.')
            let idx = follower.followers.map(obj => obj.username).indexOf(req.body.data.receiver);
            if (idx > -1) { 
                follower.followers.splice(idx, 1);
                newFollower = follower.followers;
            }                
        } 
    }).clone()
    await Follower.findOneAndReplace({username: req.body.data.sender}, {username: req.body.data.sender, followers: newFollower}).clone()
}

async function addAsFriend(req) {
    console.log('Debug: These authors need to be added as friends.')

    let success = true;

    console.log('Debug: Remove from following and follower to make friends.')
    removeFromFollow(req);

    console.log('Debug: Add sender to receiver friend list.')
    let newFriendReceiver = [];
    await Friend.findOne({username: req.body.data.receiver}, function(err, friend) {
        if (friend) {
            console.log('Debug: Receiver has friend list.')
            friend.friends.push({username: req.body.data.sender});
            newFriendReceiver = friend.friends;
        } else {
            console.log('Debug: Receiver does not have a friend list yet.')
            var new_friend = new Friend({
                username: req.body.data.receiver,
                friends: [{
                    username: req.body.data.sender,
                }]
            });

            new_friend.save(async (err, friend, next) => {
                if (err) {
                    success = false;
                }
            })
        }
    }).clone()
    if (newFriendReceiver.length) {
        await Friend.findOneAndReplace({username: req.body.data.receiver}, {username: req.body.data.receiver, friends: newFriendReceiver}).clone()
    }

    console.log('Debug: Add receiver to sender friend list.')
    let newFriendSender = [];
    await Friend.findOne({username: req.body.data.sender}, function(err, friend) {
        if (friend) {
            console.log('Debug: Sender has friend list.')
            friend.friends.push({username: req.body.data.receiver});
            newFriendSender = friend.friends;
        } else {
            console.log('Debug: Sender does not have a friend list yet.')
            var new_friend = new Friend({
                username: req.body.data.sender,
                friends: [{
                    username: req.body.data.receiver,
                }]
            });
            new_friend.save(async (err, friend, next) => {
                if (err) {
                    success = false;
                }
            })
        }
    }).clone()
    if (newFriendSender.length) {
        await Friend.findOneAndReplace({username: req.body.data.sender}, {username: req.body.data.sender, friends: newFriendSender}).clone();
    }

    return success;
}

module.exports={
    saveRequest,
    deleteRequest,
    findRequest,
    findAllRequests,
    senderAdded
}
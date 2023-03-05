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
const { Request, Follower, Following, Friend, Login, Author } = require('../db_schema/authorSchema.js');

// Additional Functions
const { getAuthorId } = require('./author.js');

async function saveRequest(req, res) {  
    const senderId = getAuthorId(req.body.data.sender);
    const receiverId = getAuthorId(req.body.data.receiver);
    const sender = await Author.findOne({_id: senderId});
    const receiver = await Author.findOne({_id: receiverId});

    console.log('Debug: See if receiver is following sender (meaning request is friends)')
    let type = 'follow';
    await Following.findOne({authorId: receiverId}, function(err, following){
        console.log('Debug: See if viewer is viewing someone they follow.')
        if (following) {
            console.log('Debug: This viewer does follow people, but do they follow the viewed.')
            let idx = following.items.map(obj => obj.authorId).indexOf(senderId);
            if (idx > -1) { 
                type = 'friend';
            }
        } 
    }).clone()

    var request = new Request({
        type: type,
        summary: sender.displayName + ' wants to ' + type + ' ' + receiver.displayName, 
        actor: sender,
        object: receiver
    });

    request.save(async (err, request, next) => {
        if (err) {
            return res.json({ status: false });
        } else {
            return res.json({ status: true });
        }
    });
}

async function deleteRequest(req, res) {
    console.log('Debug: Deleting request.')

    let reqSender = null;
    let reqReceiver = null;
    if (req.body.sender === undefined) {
        reqSender = req.body.data.sender;
        reqReceiver = req.body.data.receiver;
    } else {
        reqSender = req.body.sender;
        reqReceiver = req.body.receiver;
    }

    const sender = getAuthorId(reqSender);
    const receiver = getAuthorId(reqReceiver);

    await Request.deleteOne({'actor._id': sender, 'object._id': receiver}, function(err, request){
        if (request) {
            console.log("Debug: Request does exist and was deleted.");
            return res.json({ status: true });
        } else {
            return res.json({ status: false });
        }
    }).clone()
}

async function findRequest(req, res) {
    const sender = getAuthorId(req.body.data.sender);
    const receiver = getAuthorId(req.body.data.receiver);
    await Request.findOne({'actor._id': sender, 'object._id': receiver}, function(err, request) {
        if (request) {
            console.log("Debug: Request does exist.");
            return res.json({ status: true });
        } else {
            return res.json({ status: false });
        }
    }).clone()
}

async function findAllRequests(req, res) {
    let authorId = '';
    await Login.findOne({token: req.cookies.token}, async function(err, login) {
        console.log('Debug: Retrieving current author logged in')
        authorId = login.authorId
        
        await Request.find({'object._id': authorId}, function(err, requests){
            console.log("Debug: Requests exists");
            return res.json({ requests: requests });
        }).clone()
    }).clone();
}

async function senderAdded(req, res) {
    console.log('Debug: Need to check if the receiver is already following the sender.')

    const senderId = getAuthorId(req.body.data.sender);
    const receiverId = getAuthorId(req.body.data.receiver);

    let friend = false; 
    const sender = await Author.findOne({_id: senderId});
    const receiver = await Author.findOne({_id: receiverId});
    await Following.findOne({authorId: receiverId}, async function(err, following){
        if (following) {
            console.log("Debug: Receiver has a following list. Now, we need to find the sender in their following list.");
            let idx = following.items.map(obj => obj.authorId).indexOf(senderId);
            if (idx > -1) { friend = true; }
        } else { console.log('The Receiver does not currently have a following list (following no one).') }
        if (!friend) {
            if (await addAsFollow(senderId, receiverId, sender, receiver)) {
                console.log('Debug: Delete the request since it has been accepted.')
                await deleteRequest(req, res);
            } else {
                return res.json({
                    status: false
                });
            }
        } else {
            if (await addAsFriend(senderId, receiverId, sender, receiver)) {
                console.log('Debug: Delete the request since it has been accepted.')
                await deleteRequest(req, res);
            } else {
                return res.json({
                    status: false
                });
            }
        }
    }).clone()
}

async function addAsFollow(senderId, receiverId, sender, receiver) {
    console.log('Debug: Added as a follower.')

    let success = true;

    console.log('Debug: Add receiver to sender following list.')
    let newFollowing = [];
    await Following.findOne({authorId: senderId}, function(err, following) {
        if (following) {
            console.log('Debug: Sender already has a following list, must add to existing list.')
            following.followings.push(receiver);
            newFollowing = following.followings;
        } else {
            console.log('Debug: Sender does not have a following list (has not followed anyone), must make one.')
            var following = new Following({
                type: 'followings',
                authorId: senderId,
                items: [receiver]
            });

            following.save(async (err, following, next) => {
                if (err) { success = false; }
            })
        }
    }).clone()
    if (newFollowing.length) {
        await Following.findOneAndReplace({authorId: senderId}, {type: 'followings', authorId: senderId, items: newFollowing}).clone()
    }

    let newFollower = [];
    console.log('Debug: Add sender to follower list.')
    await Follower.findOne({authorId: receiverId}, function(err, follower){
        console.log('Debug: Add sender to receiver follower list')
        if (follower) {
            console.log('Debug: Receiver already has a follower list, must add to existing list.')
            follower.items.push(sender);
            newFollower = follower.items;
        } else {
            console.log('Debug: Receiver does not have a follower list (has no followers), must make one.')
            var follower = new Follower({
                type: 'followers',
                authorId: receiverId,
                items: [sender]
            });
            follower.save(async (err, follower, next) => {
                if (err) { success = false; }
            })
        }
    }).clone()
    if (newFollower.length) {
        await Follower.findOneAndReplace({authorId: receiverId}, {type: 'followers', authorId: receiverId, items: newFollower}).clone()
    }

    return success;
}

async function removeFromFollow(senderId, receiverId) {
    console.log('Debug: Remove sender from receiver following list.')
    let newFollowing = [];
    await Following.findOne({authorId: receiverId}, function(err, following) {
        if (following) {
            let idx = following.items.map(obj => obj.authorId).indexOf(senderId);
            if (idx > -1) { 
                following.items.splice(idx, 1);
                newFollowing = following.items;
            }
        }
    }).clone()
    await Following.findOneAndReplace({authorId: receiverId}, {type: 'followings', authorId: receiverId, items: newFollowing}).clone()

    console.log('Debug: Remove receiver from sender follower list.')
    let newFollower = [];
    await Follower.findOne({authorId: senderId}, function(err, follower) {
        if (follower) {
            console.log('Debug: We found sender follower list, now we need to delete receiver.')
            let idx = follower.items.map(obj => obj.authorId).indexOf(receiverId);
            if (idx > -1) { 
                follower.items.splice(idx, 1);
                newFollower = follower.items;
            }                
        } 
    }).clone()
    await Follower.findOneAndReplace({authorId: senderId}, {type: 'followers', authorId: senderId, items: newFollowing}).clone()
}

async function addAsFriend(senderId, receiverId, sender, receiver) {
    console.log('Debug: These authors need to be added as friends.')
    
    console.log('Debug: Remove from following and follower to make friends.')
    removeFromFollow(senderId, receiverId);

    let newFriendReceiver = [];
    await Friend.findOne({authorId: receiverId}, function(err, friend){
        console.log('Debug: Add sender to receiver friend list.')
        if (friend) {
            console.log('Debug: Receiver has friend list.')
            friend.items.push(sender);
            newFriendReceiver = friend.items;
        } else {
            console.log('Debug: Receiver does not have a friend list yet.')
            var new_friend = new Friend({
                type: 'friends',
                authorId: receiverId,
                items: [sender]
            });

            new_friend.save(async (err, friend, next) => {
                if(err){ success = false; }
            })
        }
    }).clone()
    if (newFriendReceiver.length) {
        await Friend.findOneAndReplace({authorId: receiverId}, {type: 'friends', authorId: receiverId, items: newFriendReceiver}).clone()
    }

    let newFriendSender = [];
    await Friend.findOne({authorId: senderId}, function(err, friend){
        console.log('Debug: Add receiver to sender friend list.')
        if (friend) {
            console.log('Debug: Sender has friend list.')
            friend.items.push(receiver);
            newFriendSender = friend.items;
        } else {
            console.log('Debug: Sender does not have a friend list yet.')
            var new_friend = new Friend({
                type: 'friends',
                authorId: senderId,
                items: [receiver]
            });

            new_friend.save(async (err, friend, next) => {
                if (err) { success = false; }
            })
        }
    }).clone()
    if (newFriendSender.length) {
        await Friend.findOneAndReplace({authorId: senderId}, {type: 'friends', authorId: senderId, items: newFriendSender}).clone();
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
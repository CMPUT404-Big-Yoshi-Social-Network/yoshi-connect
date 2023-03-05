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
const { Request, Follower, Following, Friend, Login, Author } = require('../db_schema/author_schema.js');

async function saveRequest(req, res) {  
    const sender = await Author.findOne({_id: req.body.data.sender});
    const receiver = await Author.findOne({_id: req.body.data.receiver});

    console.log('Debug: See if receiver is following sender (meaning request is friends)')
    let type = 'follow';
    await Following.findOne({authorId: req.body.data.receiver}, function(err, following){
        console.log('Debug: See if viewer is viewing someone they follow.')
        if (following) {
            console.log('Debug: This viewer does follow people, but do they follow the viewed.')
            let idx = following.items.map(obj => obj.authorId).indexOf(req.body.data.sender);
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

    let sender = null;
    let receiver = null;
    if (req.body.sender === undefined) {
        sender = req.body.data.sender;
        receiver = req.body.data.receiver;
    } else {
        sender = req.body.sender;
        receiver = req.body.receiver;
    }

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
    await Request.findOne({'actor._id': req.body.data.sender, 'object._id': req.body.data.receiver}, function(err, request) {
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
    await Login.findOne({token: req.body.data.sessionId}, async function(err, login) {
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

    let friend = false; 
    const sender = await Author.findOne({_id: req.body.data.sender});
    const receiver = await Author.findOne({_id: req.body.data.receiver});
    await Following.findOne({authorId: req.body.data.receiver}, async function(err, following){
        if (following) {
            console.log("Debug: Receiver has a following list. Now, we need to find the sender in their following list.");
            let idx = following.items.map(obj => obj.authorId).indexOf(req.body.data.sender);
            if (idx > -1) { friend = true; }
        } else { console.log('The Receiver does not currently have a following list (following no one).') }
        if (!friend) {
            if (await addAsFollow(req, sender, receiver)) {
                console.log('Debug: Delete the request since it has been accepted.')
                await deleteRequest(req, res);
            } else {
                return res.json({
                    status: false
                });
            }
        } else {
            if (await addAsFriend(req, sender, receiver)) {
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

async function addAsFollow(req, sender, receiver) {
    console.log('Debug: Added as a follower.')

    let success = true;

    console.log('Debug: Add receiver to sender following list.')
    let newFollowing = [];
    await Following.findOne({authorId: req.body.data.sender}, function(err, following) {
        if (following) {
            console.log('Debug: Sender already has a following list, must add to existing list.')
            following.followings.push(receiver);
            newFollowing = following.followings;
        } else {
            console.log('Debug: Sender does not have a following list (has not followed anyone), must make one.')
            var following = new Following({
                type: 'followings',
                authorId: req.body.data.sender,
                items: [receiver]
            });

            following.save(async (err, following, next) => {
                if (err) { success = false; }
            })
        }
    }).clone()
    if (newFollowing.length) {
        await Following.findOneAndReplace({authorId: req.body.data.sender}, {type: 'followings', authorId: req.body.data.sender, items: newFollowing}).clone()
    }

    let newFollower = [];
    console.log('Debug: Add sender to follower list.')
    await Follower.findOne({authorId: req.body.data.receiver}, function(err, follower){
        console.log('Debug: Add sender to receiver follower list')
        if (follower) {
            console.log('Debug: Receiver already has a follower list, must add to existing list.')
            follower.items.push(sender);
            newFollower = follower.items;
        } else {
            console.log('Debug: Receiver does not have a follower list (has no followers), must make one.')
            var follower = new Follower({
                type: 'followers',
                authorId: req.body.data.receiver,
                items: [sender]
            });
            follower.save(async (err, follower, next) => {
                if (err) { success = false; }
            })
        }
    }).clone()
    if (newFollower.length) {
        await Follower.findOneAndReplace({authorId: req.body.data.receiver}, {type: 'followers', authorId: req.body.data.receiver, items: newFollower}).clone()
    }

    return success;
}

async function removeFromFollow(req) {
    console.log('Debug: Remove sender from receiver following list.')
    let newFollowing = [];
    await Following.findOne({authorId: req.body.data.receiver}, function(err, following) {
        if (following) {
            let idx = following.items.map(obj => obj.authorId).indexOf(req.body.data.sender);
            if (idx > -1) { 
                following.items.splice(idx, 1);
                newFollowing = following.items;
            }
        }
    }).clone()
    await Following.findOneAndReplace({authorId: req.body.data.receiver}, {type: 'followings', authorId: req.body.data.receiver, items: newFollowing}).clone()

    console.log('Debug: Remove receiver from sender follower list.')
    let newFollower = [];
    await Follower.findOne({authorId: req.body.data.sender}, function(err, follower) {
        if (follower) {
            console.log('Debug: We found sender follower list, now we need to delete receiver.')
            let idx = follower.items.map(obj => obj.authorId).indexOf(req.body.data.receiver);
            if (idx > -1) { 
                follower.items.splice(idx, 1);
                newFollower = follower.items;
            }                
        } 
    }).clone()
    await Follower.findOneAndReplace({authorId: req.body.data.sender}, {type: 'followers', authorId: req.body.data.sender, items: newFollowing}).clone()
}

async function addAsFriend(req, sender, receiver) {
    console.log('Debug: These authors need to be added as friends.')
    
    console.log('Debug: Remove from following and follower to make friends.')
    removeFromFollow(req);

    let newFriendReceiver = [];
    await Friend.findOne({authorId: req.body.data.receiver}, function(err, friend){
        console.log('Debug: Add sender to receiver friend list.')
        if (friend) {
            console.log('Debug: Receiver has friend list.')
            friend.items.push(sender);
            newFriendReceiver = friend.items;
        } else {
            console.log('Debug: Receiver does not have a friend list yet.')
            var new_friend = new Friend({
                type: 'friends',
                authorId: req.body.data.receiver,
                items: [sender]
            });

            new_friend.save(async (err, friend, next) => {
                if(err){ success = false; }
            })
        }
    }).clone()
    if (newFriendReceiver.length) {
        await Friend.findOneAndReplace({authorId: req.body.data.receiver}, {type: 'friends', authorId: req.body.data.receiver, items: newFriendReceiver}).clone()
    }

    let newFriendSender = [];
    await Friend.findOne({authorId: req.body.data.sender}, function(err, friend){
        console.log('Debug: Add receiver to sender friend list.')
        if (friend) {
            console.log('Debug: Sender has friend list.')
            friend.items.push(receiver);
            newFriendSender = friend.items;
        } else {
            console.log('Debug: Sender does not have a friend list yet.')
            var new_friend = new Friend({
                type: 'friends',
                authorId: req.body.data.sender,
                items: [receiver]
            });

            new_friend.save(async (err, friend, next) => {
                if (err) { success = false; }
            })
        }
    }).clone()
    if (newFriendSender.length) {
        await Friend.findOneAndReplace({authorId: req.body.data.sender}, {type: 'friends', authorId: req.body.data.sender, items: newFriendSender}).clone();
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
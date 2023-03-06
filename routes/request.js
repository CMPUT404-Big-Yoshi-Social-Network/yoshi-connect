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
const { Request, Follower, Following, Friend, Login, Author } = require('../dbSchema/authorScheme.js');

async function saveRequest(req, res) {  
    /**
     * Description: Saves the request to the database
     * Returns: If successful, { status: "Successful"} also returns a status
     *          If failed, { status: "Unsuccessful" } also returns a status
     */
    const senderUUID = (await Author.findOne({username: req.body.data.sender}))._id;
    const receiverUUID = (await Author.findOne({username: req.body.data.receiver}))._id;

    var request = new Request({
        senderId: req.body.data.sender,
        senderUUID: senderUUID,
        receiverId: req.body.data.receiver,
        receiverUUID: receiverUUID,
        status: 'Stranger'
    });

    request.save(async (err, author, next) => {
        if (err) {
            return res.json({ status: "Unsuccessful" });
        } else {
            return res.json({ status: "Successful" });
        }
    });
}

async function deleteRequest(req) {
    /**
     * Description: Deletes the request from the database
     * Returns: If successful, { status: "Successful"}
     *          If failed, { status: "Unsuccessful" } 
     */
    let sender = null;
    let receiver = null;

    if (req.body.sender === undefined) {
        sender = req.body.data.sender;
        receiver = req.body.data.receiver;
    } else {
        sender = req.body.sender;
        receiver = req.body.receiver;
    }

    await Request.deleteOne({sendId: sender, receiverId: receiver}, function(err, request){
        if(request){
            console.log("Debug: Request does exist and was deleted.")
        } 
    }).clone()
}

async function findRequest(req, res) {
    /**
     * Description: Gets the correct request form the database
     * Returns: If successful, { status: "Successful"}
     *          If failed, { status: "Unsuccessful" } 
     */
    await Request.findOne({sendId: req.body.data.sender, receiverId: req.body.data.receiver}, function(err, request){
        if(request){
            console.log("Debug: Request does exist.");
            return res.json({ status: "Successful" });
        } else {
            return res.json({ status: "Unsuccessful" });
        }
    }).clone()
}

async function findAllRequests(req, res) {
    /**
     * Description: Gets the all request form the database
     * Returns: A list of all requests in the form {requests: [request]} 
     */
    let username = '';
    await Login.findOne({token: req.cookies.token}, async function(err, login) {
        console.log('Debug: Retrieving current author logged in')
        username = login.username
        await Request.find({receiverId: username}, function(err, requests){
            console.log("Debug: Requests exists");
            return res.json({ requests: requests });
        }).clone()
    }).clone();
}

async function senderAdded(req, res) {
    /**
     * Description: Checks if the author is already following the sender, calls the function adding if not following
     * Returns: N/A 
     */
    console.log('Debug: Need to check if the receiver is already following the sender.')

    let friend = false; 
    await Following.findOne({username: req.body.data.receiver}, function(err, following){
        if (following) {
            console.log("Debug: Receiver has a following list. Now, we need to find the sender in their following list.");
            let idx = following.followings.map(obj => obj.username).indexOf(req.body.data.sender);
            if (idx > -1) { friend = true; }
        } else {
            console.log('The Receiver does not currently have a following list (following no one).')
        }
        adding(friend, req, res);
    }).clone()
}

async function adding(friend, req, res) {
    /**
     * Description: Adds the sender to either the following list, the followers list, or the friends list depending on the status of the two users 
     *              after the author accepts the request. It then deletes the request
     * Returns: If successful, N/A
     *          If failed, { status: "Unsuccessful" }       
     */
    let success = true;

    const senderUUID = await Author.findOne({username: req.body.data.sender});
    const receiverUUID = await Author.findOne({username: req.body.data.receiver});

    if (!friend) {
        console.log('Debug: Added as a follower.')
        await Following.findOne({username: req.body.data.sender}, async function(err, following){
            console.log('Debug: Add receiver to sender following list')
            if (following) {
                console.log('Debug: Sender already has a following list, must add to existing list.')
                following.followings.push({username: req.body.data.receiver, authorId: receiverUUID._id});
                following.save();
            } else {
                console.log('Debug: Sender does not have a following list (has not followed anyone), must make one.')
                let following = new Following({
                    username: req.body.data.sender,
                    authorId: senderUUID._id,
                    followings: [{
                        username: req.body.data.receiver,
                        authorId: receiverUUID._id
                    }]
                });
                following.save();
            }
        }).clone()
        
        console.log('Debug: Add sender to follower list.')
        await Follower.findOne({username: req.body.data.receiver}, async function(err, follower){
            if (follower) {
                console.log('Debug: Receiver already has a follower list, must add to existing list.')
                follower.followers.push({username: req.body.data.sender, authorId: senderUUID._id});
                follower.save();
            } else {
                console.log('Debug: Receiver does not have a follower list (has no followers), must make one.')
                let follower = new Follower({
                    username: req.body.data.receiver,
                    authorId: receiverUUID._id,
                    followers: [{
                        username: req.body.data.sender,
                        authorId: senderUUID._id
                    }]
                });
                follower.save();
            }
        }).clone()

        if (success) {
            console.log('Debug: Delete the request since it has been accepted.')
            await deleteRequest(req, res);
        } else {
            return res.json({ status: "Unsuccessful" });
        }
    } else {
        console.log('Debug: These authors need to be added as friends.')

        await Following.findOne({username: req.body.data.receiver}, async function(err, following){
            console.log('Debug: Find sender from receiver following list.')
            if (following) {
                let idx = following.followings.map(obj => obj.username).indexOf(req.body.data.sender);
                if (idx > -1) { 
                    following.followings.splice(idx, 1);
                    await following.save();
                }
            }
        }).clone()
        
        await Follower.findOne({username: req.body.data.sender}, async function(err, follower){
            console.log('Debug: Remove receiver from sender follower list.')
            if (follower) {
                console.log('Debug: We found sender follower list, now we need to delete receiver.')
                let idx = follower.followers.map(obj => obj.username).indexOf(req.body.data.receiver);
                if (idx > -1) { 
                    follower.followers.splice(idx, 1);
                    await follower.save();
                }                
            } 
        }).clone()
        
        await Friend.findOne({username: req.body.data.receiver}, async function(err, friend){
            console.log('Debug: Add sender to receiver friend list.')
            if (friend) {
                console.log('Debug: Receiver has friend list.')
                friend.friends.push({username: req.body.data.sender, authorId: senderUUID._id});
                await friend.save();
            } else {
                console.log('Debug: Receiver does not have a friend list yet.')
                var newFriend = new Friend({
                    username: req.body.data.receiver,
                    authorId: receiverUUID._id,
                    friends: [{
                        username: req.body.data.sender,
                        authorId: senderUUID._id
                    }]
                });
    
                newFriend.save(async (err, friend, next) => {
                    if(err){
                        console.log(err);
                        success = false;
                    }
                })
            }
        }).clone()

        await Friend.findOne({username: req.body.data.sender}, async function(err, friend){
            if (friend) {
                console.log('Debug: Sender has friend list.')
                friend.friends.push({username: req.body.data.receiver, authorId: receiverUUID._id});
                await friend.save();
            } else {
                console.log('Debug: Sender does not have a friend list yet.')
                var newFriend = new Friend({
                    username: req.body.data.sender,
                    authorId: senderUUID._id,
                    friends: [{
                        username: req.body.data.receiver,
                        authorId: receiverUUID._id
                    }]
                });
    
                newFriend.save(async (err, friend, next) => {
                    if (err) { success = false; }
                })
            }
        }).clone()

        if (success) {
            console.log('Debug: Delete the request since it has been accepted.')
            await deleteRequest(req, res);
        } else {
            return res.json({ status: "Unsuccessful" });
        }

    }
}

/**
 * API UPDATE
 */

async function sendRequest(authorId, foreignId, res) {
    const actor = await Author.findOne({_id: authorId});  
    const object = await Author.findOne({_id: foreignId});
    let summary = ''
    let type = ''

    let needFriend = false;
    
    console.log('Debug: We need to check if object follows actor (meaning they will become friends).');
    await Following.findOne({authorId: object._id}, function(err, following){
        if (following == undefined) { 
            let idx = following.followings.map(obj => obj.authorId).indexOf(actor._id);
            if (idx > -1) { 
              needFriend = true;  
            }
        }
    }).clone();

    if (needFriend) {
        type = 'friend'
        summary = actor.username + "wants to " + type + " " + object.username;
    } else {
        type = 'follow'
        summary = actor.username + "wants to " + type + " " + object.username;
    }

    const request = new Request({
        type: type,
        sender: actor.username,
        senderId: actor._id,
        receiverId: object._id,
        receiver: object.username
    });
    request.save(async (err, request, next) => { if (err) { return 400; } });

    request.save(async (err, author, next) => {
        if (err) {
            return res.json({ status: "Unsuccessful" });
        } else {
            return res.json({ status: "Successful" });
        }
    });

    return {
        type: type,
        summary: summary,
        actor: actor,
        object: object
    }
}

async function deleteRequest(authorId, foreignId, res) {
    const actor = await Author.findOne({_id: authorId});  
    const object = await Author.findOne({_id: foreignId});
    let summary = '';

    const request = await Request.findOneAndDelete({senderId: actor._id, receiverId: object._id}); 
    summary = actor.username + " wants to undo " + request.type + " request to " + object.username;  

    return {
        type: request.type,
        summary: summary,
        actor: actor,
        object: object
    }
}

module.exports={
    saveRequest,
    deleteRequest,
    findRequest,
    findAllRequests,
    senderAdded,
    sendRequest
}
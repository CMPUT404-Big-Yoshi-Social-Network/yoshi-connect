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
const { Login, Author } = require('../scheme/author.js');
const { Request, Follower, Following } = require('../scheme/relations.js');

async function saveRequest(req, res) {  
    /**
     * Description: Saves the request to the database
     * Returns: If successful, { status: "Successful"} also returns a message
     *          If failed, { status: "Unsuccessful" } also returns a message
     */
    const senderUUID = await Author.findOne({username: req.body.data.sender});
    const receiverUUID = await Author.findOne({username: req.body.data.receiver});

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

async function deleteRequest(authorId, foreignId, req, res) {
    /**
     * Description: Deletes the request from the database
     * Returns: If successful, { status: "Successful"}
     *          If failed, { status: "Unsuccessful" } 
     */
    await Request.deleteOne({actorId: authorId, objectId: foreignId}, function(err, request){
        if(request){
            console.log("Debug: Request does exist and was deleted.");
            return res.json({ status: "Successful" });
        } else {
            return res.json({ status: "Unsuccessful" });
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

async function senderAdded(authorId, foreignId, req, res) {
    /**
     * Description: Checks if the author is already following the sender, calls the function adding if not following
     * Returns: N/A 
     */
    console.log('Debug: Need to check if the receiver is already following the sender.')
    let success = true;

    const actor = await Author.findOne({_id: authorId});
    const object = await Author.findOne({_id: foreignId});

    await Following.findOne({authorId: authorId}, async function(err, following){
        console.log('Debug: Add receiver to sender following list')
        if (following) {
            console.log('Debug: Sender already has a following list, must add to existing list.')
            following.followings.push({authorId: foreignId, username: object.username});
            await following.save();
        } else {
            console.log('Debug: Sender does not have a following list (has not followed anyone), must make one.')
            var following = new Following({
                username: actor.username,
                authorId: authorId,
                followings: [{
                    username: object.username,
                    authorId: foreignId
                }]
            });

            following.save(async (err, following, next) => { if (err) { success = false; } })
        }
    }).clone()

    console.log('Debug: Add sender to follower list.')
    await Follower.findOne({authorId: foreignId}, async function(err, follower){
        if (follower) {
            console.log('Debug: Receiver already has a follower list, must add to existing list.')
            follower.followers.push({username: actor.username, authorId: authorId});
            await follower.save();
        } else {
            console.log('Debug: Receiver does not have a follower list (has no followers), must make one.')
            var follower = new Follower({
                username: object.username,
                authorId: foreignId,
                followers: [{
                    username: actor.username,
                    authorId: authorId
                }]
            });
            follower.save(async (err, follower, next) => {
                if (err) { success = false; }
            })
        }
    }).clone()

    if (success) {
        console.log('Debug: Delete the request since it has been accepted.')
        await deleteRequest(authorId, foreignId, req, res);
    } else {
        return res.json({ status: "Unsuccessful" });
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
        if (following != undefined) { 
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
        actor: actor.username,
        actorId: actor._id,
        objectId: object._id,
        object: object.username
    });
    request.save(async (err, request, next) => { if (err) { return 400; } });

    return {
        type: type,
        summary: summary,
        actor: actor,
        object: object
    }
}

async function apideleteRequest(authorId, foreignId, res) {
    const actor = await Author.findOne({_id: authorId});  
    const object = await Author.findOne({_id: foreignId});
    if (!actor && !object) { return 500 }
    let summary = '';

    const request = await Request.findOneAndDelete({senderId: actor._id, receiverId: object._id}); 
    if (!request) { return 500 }
    summary = actor.username + " wants to undo " + request.type + " request to " + object.username;  

    return {
        type: request.type,
        summary: summary,
        actor: actor,
        object: object
    }
}

async function getRequests(authorId) {
    let rqs = [];
    await Request.find({objectId: authorId}, function(err, requests){
        if (!requests) { 
            rqs = []; 
        } else {
            console.log("Debug: Requests exists");
            rqs = requests;
        }
    }).clone()
    return rqs;
}

async function getRequest(authorId, foreignId, res) {
    await Request.findOne({actorId: authorId, objectId: foreignId}, function(err, request){
        if (!request) { return res.sendStatus(404); }
        return res.json({
            request: request
        })
    }).clone()
}

module.exports={
    saveRequest,
    deleteRequest,
    findRequest,
    findAllRequests,
    senderAdded,
    sendRequest,
    apideleteRequest,
    getRequests,
    getRequest
}
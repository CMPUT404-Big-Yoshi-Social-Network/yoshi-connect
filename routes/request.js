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

// UUID
const crypto = require('crypto');

// Schemas
const { Author } = require('../scheme/author.js');
const { Request, Follower, Following } = require('../scheme/relations.js');

async function senderAdded(authorId, foreignId, req, res) {
    let success = true;

    const actor = await Author.findOne({_id: authorId});
    const object = await Author.findOne({_id: foreignId});

    await Following.findOne({authorId: authorId}, async function(err, following){
        if (following) {
            following.followings.push({authorId: foreignId, username: object.username});
            await following.save();
        } else {
            let uuidFollowing = String(crypto.randomUUID()).replace(/-/g, "");
            var following = new Following({
                _id: uuidFollowing,
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

    await Follower.findOne({authorId: foreignId}, async function(err, follower){
        if (follower) {
            follower.followers.push({username: actor.username, authorId: authorId});
            await follower.save();
        } else {
            let uuidFollower = String(crypto.randomUUID()).replace(/-/g, "");
            var follower = new Follower({
                _id: uuidFollower,
                username: object.username,
                authorId: foreignId,
                followers: [{
                    username: actor.username,
                    authorId: authorId
                }]
            });
            follower.save(async (err, follower, next) => { if (err) { success = false; } })
        }
    }).clone()

    if (success) {
        await deleteRequest(authorId, foreignId, res);
    } else {
        return res.sendStatus(500);
    }
}

async function sendRequest(authorId, foreignId, res) {
    const actor = await Author.findOne({_id: authorId});  
    const object = await Author.findOne({_id: foreignId});
    let summary = ''
    let type = ''

    let needFriend = false;
    
    await Following.findOne({authorId: object._id}, function(err, following){
        if (following != undefined) { 
            let idx = following.followings.map(obj => obj.authorId).indexOf(actor._id);
            if (idx > -1) { needFriend = true; }
        }
    }).clone();

    if (needFriend) {
        type = 'friend'
        summary = actor.username + " wants to " + type + " " + object.username;
    } else {
        type = 'follow'
        summary = actor.username + " wants to " + type + " " + object.username;
    }

    let uuid = String(crypto.randomUUID()).replace(/-/g, "");

    const request = new Request({
        _id: uuid,
        type: type,
        summary: summary,
        actor: actor.username,
        actorId: actor._id,
        objectId: object._id,
        object: object.username
    });
    request.save(async (err, request, next) => { if (err) { return 400; } });

    return {
        type: type,
        summary: summary,
        actor: {
            type: 'author',
            id: process.env.DOMAIN_NAME + "authors/" + actor._id,
            host: process.env.DOMAIN_NAME,
            displayName: actor.username,
            url: process.env.DOMAIN_NAME + "authors/" + actor._id,
            github: actor.github,
            profileImage: actor.profileImage
        },
        object: {
            type: 'author',
            id: process.env.DOMAIN_NAME + "authors/" + object._id,
            host: process.env.DOMAIN_NAME,
            displayName: object.username,
            url: process.env.DOMAIN_NAME + "authors/" + object._id,
            github: object.github,
            profileImage: object.profileImage
        }
    }
}

async function deleteRequest(authorId, foreignId, res) {
    const actor = await Author.findOne({_id: authorId});  
    const object = await Author.findOne({_id: foreignId});

    if (!actor && !object) { return 500 }

    let summary = '';

    const request = await Request.findOneAndDelete({senderId: actor._id, receiverId: object._id}); 
    if (!request) { return 500 }
    summary = actor.username + " wants to undo " + request.type + " request to " + object.username;  

    return res.json({
        type: request.type,
        summary: summary,
        actor: {
            type: 'author',
            id: process.env.DOMAIN_NAME + "authors/" + actor._id,
            host: process.env.DOMAIN_NAME,
            displayName: actor.username,
            url: process.env.DOMAIN_NAME + "authors/" + actor._id,
            github: actor.github,
            profileImage: actor.profileImage
        },
        object: {
            type: 'author',
            id: process.env.DOMAIN_NAME + "authors/" + object._id,
            host: process.env.DOMAIN_NAME,
            displayName: object.username,
            url: process.env.DOMAIN_NAME + "authors/" + object._id,
            github: object.github,
            profileImage: object.profileImage
        }
    })
}

async function getRequests(authorId, res) {
    let rqs = [];
    await Request.find({objectId: authorId}, function(err, requests){
        if (!requests) { 
            rqs = []; 
        } else {
            rqs = requests;
        }
    }).clone()
    return res.json({
        "type": 'requests',
        items: rqs
    })
}

async function getRequest(authorId, foreignId, res) {
    await Request.findOne({actorId: authorId, objectId: foreignId}, function(err, request){
        if (!request) { return res.sendStatus(404); }
        return res.json(request)
    }).clone()
}

module.exports={
    senderAdded,
    sendRequest,
    deleteRequest,
    getRequests,
    getRequest
}
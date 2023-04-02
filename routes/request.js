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
const { Inbox } = require('../scheme/post.js');

async function senderAdded(authorId, foreignId, req, res) {
    /**
    Description: Adds foreign sender associated with foreignId to the server
    Associated Endpoint: N/A
    Request Type: POST
    Request Body: { authorId: 29c546d45f564a27871838825e3dbecb, foreignId: 6d45f566w5498e78tgy436h48dh96a }
    Return: 500 Status (Internal Server Error) -- Unable to add sender
            200 Status (OK) -- Sender successfully added
    */
    let success = true;
    let isLocal = true;
    const actor = await Author.findOne({_id: authorId});
    if (actor === null || actor === undefined) {
        // Must be from another server
        const outgoings = await OutgoingCredentials.find().clone();

        for (let i = 0; i < outgoings.length; i++) {
            if (outgoings[i].allowed) {
                const auth = outgoings[i].auth === 'userpass' ? { username: outgoings[i].displayName, password: outgoings[i].password } : outgoings[i].auth
                if (outgoings[i].auth === 'userpass') {
                    var config = {
                        host: outgoings[i].url,
                        url: outgoings[i].url + '/authors/' + authorId + '/',
                        method: 'GET',
                        auth: auth,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    };
                } else {
                    if (outgoings[i].url === 'https://bigger-yoshi.herokuapp.com/api') {
                    var config = {
                        host: outgoings[i].url,
                        url: outgoings[i].url + '/authors/' + authorId + '/',
                        method: 'GET',
                        headers: {
                            'Authorization': auth,
                            'Content-Type': 'application/json'
                        }
                      };              
                  } else {
                      var config = {
                        host: outgoings[i].url,
                        url: outgoings[i].url + '/authors' + authorId + '/',
                        method: 'GET',
                        headers: {
                            'Authorization': auth,
                            'Content-Type': 'application/json'
                        }
                      };
                  }
                }
          
                await axios.request(config)
                .then( res => {
                    actor = res.data 
                })
                .catch( error => { })
            }
        }
        isLocal = false;
    }
    const object = await Author.findOne({_id: foreignId});
    let uuidFollow = String(crypto.randomUUID()).replace(/-/g, "");
    let uuidF = String(crypto.randomUUID()).replace(/-/g, "");

    if (isLocal) {
        await Following.findOne({authorId: authorId}, async function(err, following){
            if (following) {
                const newF = {
                    _id: uuidFollow,
                    id: process.env.DOMAIN_NAME + "authors/" + object._id,
                    authorId: foreignId,
                    displayName: object.username,
                    github: object.github,
                    profileImage: object.profileImage
                }
                following.followings.push(newF);
                await following.save();
            } else {
                let uuidFollowing = String(crypto.randomUUID()).replace(/-/g, "");
                var following = {
                    _id: uuidFollowing,
                    username: actor.username,
                    authorId: authorId,
                    followings: [{
                        _id: uuidFollow,
                        id: process.env.DOMAIN_NAME + "authors/" + object._id,
                        authorId: foreignId,
                        displayName: object.username,
                        github: object.github,
                        profileImage: object.profileImage
                    }]
                };
                following.save(async (err, following, next) => { if (err) { success = false; } })
            }
        }).clone();
    }

    await Follower.findOne({authorId: foreignId}, async function(err, follower){
        let newFollower = {}
        if (actor.username === undefined) {
            newFollower = {
                _id: uuidF,
                id: actor.id,
                authorId: authorId,
                displayName: actor.displayName,
                github: actor.github,
                profileImage: actor.profileImage
            }
        } else {
            newFollower = {
                _id: uuidF,
                id: process.env.DOMAIN_NAME + "authors/" + actor._id,
                authorId: authorId,
                displayName: actor.username,
                github: actor.github,
                profileImage: actor.profileImage
            }
        }
        if (follower) {
            follower.followers.push(newFollower);
            await follower.save();
        } else {
            let uuidFollower = String(crypto.randomUUID()).replace(/-/g, "");
            var follower = new Follower({
                _id: uuidFollower,
                username: object.username,
                authorId: foreignId,
                followers: [newFollower]
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
    /**
    Description: Creates a request and saves it into the inbox
    Associated Endpoint: /authors/:authorId/inbox/requests/:foreignAuthorId
    Request Type: POST
    Request Body: { authorId: 29c546d45f564a27871838825e3dbecb, foreignId: 6d45f566w5498e78tgy436h48dh96a }
    Return: 200 Status (OK) -- Successfully saves the request to the Inbox 
    */
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

    const request = {
        _id: uuid,
        goal: type,
        summary: summary,
        actor: actor.username,
        actorId: actor._id,
        objectId: object._id,
        object: object.username
    }

    const inbox = await Inbox.findOne({authorId: foreignId});
    inbox.requests.push(request);
    inbox.save();

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
    /**
    Description: Deletes an Author's inbox requests
    Associated Endpoint: /authors/:authorId/inbox/requests/:foreignAuthorId
    Request Type: DELETE
    Request Body: { username: kc, email: 123@aulenrta.ca }
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
    */
    const actor = await Author.findOne({_id: authorId});  
    const object = await Author.findOne({_id: foreignId});

    const inbox = await Inbox.findOne({authorId: foreignId}, '_id requests');

    if (!actor && !object) { return 500 }

    let summary = '';
    let idx = inbox.requests.map(obj => obj.actorId).indexOf(authorId);
    const request = inbox.requests[idx]
    inbox.requests.splice(idx, 1);
    inbox.save();
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
    /**
    Description: 
    Associated Endpoint: (for example: /authors/:authorid)
    Request Type: 
    Request Body: (for example: { username: kc, email: 123@aulenrta.ca })
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
    */
    const inbox = await Inbox.findOne({authorId: authorId}, '_id requests');
    return res.json({
        "type": 'requests',
        items: inbox.requests
    })
}

async function getRequest(authorId, foreignId) {
    /**
    Description: 
    Associated Endpoint: (for example: /authors/:authorid)
    Request Type: 
    Request Body: (for example: { username: kc, email: 123@aulenrta.ca })
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
    */
    const inbox = await Inbox.findOne({authorId: foreignId}, '_id requests');
    let idx = inbox.requests.map(obj => obj.actorId).indexOf(authorId);
    return inbox.requests[idx];
}

module.exports={
    senderAdded,
    sendRequest,
    deleteRequest,
    getRequests,
    getRequest
}
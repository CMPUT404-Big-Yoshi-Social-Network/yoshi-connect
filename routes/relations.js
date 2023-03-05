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

const { Follower, Following, Friend, Author } = require('../db_schema/authorSchema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

async function createFollowers(authorId){
    await Follower({
        type: 'followers',
        authorId: authorId,
        items: []
    }).save();
}

async function createFollowings(authorId){
    await Following({
        type: 'followings',
        authorId: authorId,
        items: []
    }).save();
}

async function createFriends(authorId){
    await Friend({
        type: 'friends',
        authorId: authorId,
        items: []
    }).save();
}

async function isFriend(req, res) {
    console.log('Debug: Checking if the author is a friend or follow.');
    let checkFriend = false;
    let status = '';
    await Following.findOne({authorId: req.body.data.viewer}, function(err, following){
        console.log('Debug: See if viewer is viewing someone they follow.')
        if (following) {
            console.log('Debug: This viewer does follow people, but do they follow the viewed.')
            let idx = following.items.map(obj => obj.authorId).indexOf(req.body.data.viewed);
            if (idx > -1) { 
                console.log('Debug: They follow them (false).')
                status = 'Follows';
            } else {
                checkFriend = true;
            }
        } else {
            checkFriend = true;
        }
    }).clone()

    if (checkFriend) {
        await Friend.findOne({authorId: req.body.data.viewer}, function(err, friend){
            console.log('Debug: See if viewer is viewing someone they friended.')
            if (friend) {
                console.log('Debug: This viewer does friend people, but do they friend the viewed.')
                let idx = friend.items.map(obj => obj.authorId).indexOf(req.body.data.viewed);
                if (idx > -1) { 
                    console.log('Debug: They are friends (true).')
                    status = 'Friends';
                } 
            } 
        }).clone()
    }
    return res.json({ status: status });
}

async function unfriending(req, res) {
    console.log('Debug: Viewer is unfriending the viewed.')

    let success = true;
    let newFriendSender = [];

    const sender = await Author.findOne({_id: req.body.data.sender});
    const receiver = await Author.findOne({_id: req.body.data.receiver});

    await Friend.findOne({authorId: req.body.data.sender}, function(err, friend){
        console.log('Debug: Remove receiver from sender friend list.')
        if (friend) {
            console.log('Debug: We found sender friend list, now we need to delete receiver.')
            newFriendSender = friend.items;
            let idx = friend.items.map(obj => obj.authorId).indexOf(req.body.data.receiver);
            if (idx > -1) { 
                friend.items.splice(idx, 1);
                newFriendSender = friend.items;
            }                
        } 
    }).clone()
    await Friend.findOneAndReplace({authorId: req.body.data.sender}, {type: 'friends', authorId: req.body.data.sender, items: newFriendSender}).clone()

    let newFriendReceiver = [];
    await Friend.findOne({authorId: req.body.data.receiver}, function(err, friend){
        console.log('Debug: Remove sender from receiver friend list.')
        if (friend) {
            console.log('Debug: We found receiver friend list, now we need to delete sender.')
            newFriendReceiver = friend.items;
            let idx = friend.items.map(obj => obj.authorId).indexOf(req.body.data.sender);
            if (idx > -1) { 
                friend.items.splice(idx, 1);
                newFriendReceiver = friend.items;
            }                
        } 
    }).clone()
    await Friend.findOneAndReplace({authorId: req.body.data.receiver}, {type: 'friends', authorId: req.body.data.receiver, items: newFriendReceiver}).clone()

    let newFollowing = [];
    await Following.findOne({authorId: req.body.data.receiver}, function(err, following){
        console.log('Debug: Add sender to receiver following list')
        if (following) {
            console.log('Debug: Receiver already has a following list, must add to existing list.')
            following.items.push(sender);
            newFollowing = following.items;
        } else {
            console.log('Debug: Receiver does not have a following list (has not followed anyone), must make one.')
            var following = new Following({
                type: 'followings',
                authorId: req.body.data.receiver,
                items: [sender]
            });

            following.save(async (err, following, next) => { if (err) { success = false; } })
        }
    }).clone()
    if (newFollowing.length) {
        console.log('Debug: New following!')
        await Following.findOneAndReplace({authorId: req.body.data.receiver}, {type: 'followings', authorId: req.body.data.receiver, items: newFollowing}).clone()
    }

    let newFollower = [];
    await Follower.findOne({authorId: req.body.data.authorId}, function(err, follower){
        console.log('Debug: Add receiver to sender follower list')
        if (follower) {
            console.log('Debug: Sender already has a follower list, must add to existing list.')
            follower.items.push(receiver);
            newFollower = follower.items;
        } else {
            console.log('Debug: Sender does not have a follower list (has no followers), must make one.')
            var follower = new Follower({
                type: 'followers',
                authorId: req.body.data.sender,
                items: [receiver]
            });

            follower.save(async (err, follower, next) => { if (err) { success = false; } })
        }
    }).clone()
    if (newFollower.length) {
        console.log('Debug: New follower!')
        await Follower.findOneAndReplace({authorId: req.body.data.sender}, {type: 'followers', authorId: req.body.data.sender, items: newFollower}).clone()
    }

    return res.json({ status: success });
}

async function unfollowing(req, res) {
    console.log('Debug: Viewer is unfollowing the viewed.')

    let newFollowing = [];
    let success = true;

    await Following.findOne({authorId: req.body.data.sender}, function(err, following){
        console.log('Debug: Remove viewed to viewer following list')
        if (err) { success = false; }
        if (following) {
            newFollowing = following.items;
            let idx = following.items.map(obj => obj.authorId).indexOf(req.body.data.receiver);
            if (idx > -1) { 
                following.items.splice(idx, 1);
                newFollowing = following.items;
            } 
        } 
    }).clone()
    await Following.findOneAndReplace({authorId: req.body.data.sender}, {type: 'followings', authorId: req.body.data.sender, items: newFollowing}).clone()

    let newFollower = [];
    await Follower.findOne({authorId: req.body.data.receiver}, function(err, follower){
        console.log('Debug: Remove viewer to viewed follower list')
        if (err) { success = false; }
        if (follower) {
            newFollower = follower.items;
            let idx = follower.items.map(obj => obj.authorId).indexOf(req.body.data.sender);
            if (idx > -1) { 
                follower.items.splice(idx, 1);
                newFollower = follower.items;
            }
        } 
    }).clone()
    await Follower.findOneAndReplace({authorId: req.body.data.receiver}, {type: 'followers', authorId: req.body.data.receiver, items: newFollower}).clone()

    return res.json({ status: success });
}

module.exports={
    isFriend,
    unfriending,
    unfollowing,
    createFollowers,
    createFollowings,
    createFriends,
}
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
const { Follower, Following, Friend } = require('../dbSchema/authorScheme.js');

async function createFollowers(username, authorId){
    /**
     * Description: Creates a new entry in the database follower collection.
     * Returns: N/A
     */
    await Follower({ username: username, authorId: authorId, followers: [] }).save();
}

async function createFollowings(username, authorId){
    /**
     * Description: Creates a new entry in the database following collection.
     * Returns: N/A
     */
    await Following({ username: username, authorId: authorId, followings: [] }).save();
}

async function createFriends(username, authorId){
    /**
     * Description: Creates a new entry in the database friends collection.
     * Returns: N/A
     */
    await Friend({ username: username, authorId: authorId, friends: [] }).save();
}

async function isFriend(req, res) {
    /**
     * Description: Checks if the selected author is a friend or follower
     * Returns: { status: "Friend" | "Follower" } 
     */
    console.log('Debug: Checking if the author is a friend or follow.');

    let checkFriend = false;
    let status = '';

    await Following.findOne({username: req.body.data.viewer}, function(err, following){
        if (following) {
            console.log('Debug: This viewer does follow people, but do they follow the viewed.')
            let idx = following.followings.map(obj => obj.username).indexOf(req.body.data.viewed);
            if (idx > -1) { 
                console.log('Debug: They follow them.')
                status = 'Follows';
            } else {
                checkFriend = true;
            }
        } else {
            checkFriend = true;
        }
    }).clone()

    if (checkFriend) {
        await Friend.findOne({username: req.body.data.viewer}, function(err, friend){
            if (friend) {
                console.log('Debug: This viewer does friend people, but do they friend the viewed.')
                let idx = friend.friends.map(obj => obj.username).indexOf(req.body.data.viewed);
                if (idx > -1) { 
                    console.log('Debug: They are friends.')
                    status = 'Friends';
                } 
            } 
        }).clone()
    }

    return res.json({ status: status });
}

async function unfriending(req, res) {
    /**
     * Description: Unfriends the selected author
     * Returns: if success { status: true } else { status: false }
     */
    console.log('Debug: Viewer is unfriending the viewed.')

    let success = true;

    await Friend.findOne({username: req.body.data.sender}, async function(err, friend){
        if (friend) {
            console.log('Debug: We found sender friend list, now we need to delete receiver.')
            let idx = friend.friends.map(obj => obj.username).indexOf(req.body.data.receiver);
            if (idx > -1) { 
                friend.friends.splice(idx, 1);
                await friend.save();
            }                
        } 
    }).clone()

    await Friend.findOne({username: req.body.data.receiver}, async function(err, friend){
        if (friend) {
            console.log('Debug: We found receiver friend list, now we need to delete sender.')
            let idx = friend.friends.map(obj => obj.username).indexOf(req.body.data.sender);
            if (idx > -1) { 
                friend.friends.splice(idx, 1);
                await friend.save();
            }                
        } 
    }).clone()

    await Following.findOne({username: req.body.data.receiver}, async function(err, following){
        if (following) {
            console.log('Debug: Receiver already has a following list, must add to existing list.')
            following.followings.push({username: req.body.data.sender});
            await following.save();
        } else {
            console.log('Debug: Receiver does not have a following list (has not followed anyone), must make one.')
            var following = new Following({
                username: req.body.data.receiver,
                followings: [{ username: req.body.data.sender }]
            });

            following.save(async (err, following, next) => {
                if (err) { success = false; }
            })
        }
    }).clone()

    await Follower.findOne({username: req.body.data.sender}, async function(err, follower){
        if (follower) {
            console.log('Debug: Sender already has a follower list, must add to existing list.')
            follower.followers.push({username: req.body.data.receiver});
            await follower.save();
        } else {
            console.log('Debug: Sender does not have a follower list (has no followers), must make one.')
            var follower = new Follower({
                username: req.body.data.sender,
                followers: [{ username: req.body.data.receiver }]
            });

            follower.save(async (err, follower, next) => {
                if (err) { success = false; }
            })
        }
    }).clone()

    return res.json({ status: success });
}

async function unfollowing(req, res) {
    /**
     * Description: Unfollows the selected author
     * Returns: if success { status: true } else { status: false }
     */
    console.log('Debug: Viewer is unfollowing the viewed.')

    let success = true;

    await Following.findOne({username: req.body.data.sender}, async function(err, following){
        console.log('Debug: Remove viewed to viewer following list')
        if (err) { success = false; }
        if (following) {
            let idx = following.followings.map(obj => obj.username).indexOf(req.body.data.receiver);
            if (idx > -1) { 
                following.followings.splice(idx, 1);
                await following.save();
            } 
        } 
    }).clone()

    await Follower.findOne({username: req.body.data.receiver}, async function(err, follower){
        console.log('Debug: Remove viewer to viewed follower list')
        if (err) { success = false; }
        if (follower) {
            let idx = follower.followers.map(obj => obj.username).indexOf(req.body.data.sender);
            if (idx > -1) { 
                follower.followers.splice(idx, 1);
                await follower.save();
            }
        } 
    }).clone()

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
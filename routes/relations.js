const { follower_scheme, following_scheme, friend_scheme } = require('../db_schema/author_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;
const Follower = database.model('Follower', follower_scheme);
const Following = database.model('Following', following_scheme);
const Friend = database.model('Friend', friend_scheme);

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
                console.log('Debug: They follow them.')
                status = 'Follows';
            } else {
                checkFriend = true;
            }
        } 
    }).clone()

    if (checkFriend) {
        await Friend.findOne({username: req.body.data.viewer}, function(err, friend){
            console.log('Debug: See if viewer is viewing someone they friended.')
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
    return res.json({
        status: status
    });
}

async function unfriending(req, res) {
    console.log('Debug: Viewer is unfriending the viewed.')
    let success = true;

    let new_friend_sender = [];
    await Friend.findOne({username: req.body.data.sender}, function(err, friend){
        console.log('Debug: Remove receiver from sender friend list.')
        if (friend) {
            console.log('Debug: We found sender friend list, now we need to delete receiver.')
            new_friend_sender = friend.friends;
            let idx = friend.friends.map(obj => obj.username).indexOf(req.body.data.receiver);
            if (idx > -1) { 
                friend.friends.splice(idx, 1);
                new_friend_sender = friend.friends;
            }                
        } 
    }).clone()
    await Friend.findOneAndReplace({username: req.body.data.sender}, {username: req.body.data.sender, friends: new_friend_sender}).clone()

    let new_friend_receiver = [];
    await Friend.findOne({username: req.body.data.receiver}, function(err, friend){
        console.log('Debug: Remove sender from receiver friend list.')
        if (friend) {
            console.log('Debug: We found receiver friend list, now we need to delete sender.')
            new_friend_receiver = friend.friends;
            let idx = friend.friends.map(obj => obj.username).indexOf(req.body.data.sender);
            if (idx > -1) { 
                friend.friends.splice(idx, 1);
                new_friend_receiver = friend.friends;
            }                
        } 
    }).clone()
    await Friend.findOneAndReplace({username: req.body.data.receiver}, {username: req.body.data.receiver, friends: new_friend_receiver}).clone()

    let new_following = [];
    await Following.findOne({username: req.body.data.receiver}, function(err, following){
        console.log('Debug: Add sender to receiver following list')
        if (following) {
            console.log('Debug: Receiver already has a following list, must add to existing list.')
            following.followings.push({username: req.body.data.sender});
            new_following = following.followings;
        } else {
            console.log('Debug: Receiver does not have a following list (has not followed anyone), must make one.')
            var following = new Following({
                username: req.body.data.receiver,
                followings: [{
                    username: req.body.data.sender,
                }]
            });

            following.save(async (err, following, next) => {
                if(err){
                    console.log(err);
                    success = false;
                }
            })
        }
    }).clone()
    if (new_following.length) {
        await Following.findOneAndReplace({username: req.body.data.receiver}, {username: req.body.data.receiver, followings: new_following}).clone()
    }

    let new_follower = [];
    await Follower.findOne({username: req.body.data.sender}, function(err, follower){
        console.log('Debug: Add receiver to sender follower list')
        if (follower) {
            console.log('Debug: Sender already has a follower list, must add to existing list.')
            follower.followers.push({username: req.body.data.receiver});
            new_follower = follower.followers;
        } else {
            console.log('Debug: Sender does not have a follower list (has no followers), must make one.')
            var follower = new Follower({
                username: req.body.data.sender,
                followers: [{
                    username: req.body.data.receiver,
                }]
            });

            follower.save(async (err, follower, next) => {
                if(err){
                    console.log(err);
                    success = false;
                }
            })
        }
    }).clone()
    if (new_follower.length) {
        await Follower.findOneAndReplace({username: req.body.data.sender}, {username: req.body.data.sender, followers: new_follower}).clone()
    }

    return res.json({
        status: success
    });
}

async function unfollowing(req, res) {
    console.log('Debug: Viewer is unfollowing the viewed.')
    let new_following = [];
    let success = true;
    await Following.findOne({username: req.body.data.sender}, function(err, following){
        console.log('Debug: Remove viewed to viewer following list')
        if (err) { 
            success = false;
        }
        if (following) {
            new_following = following.followings;
            let idx = following.followings.map(obj => obj.username).indexOf(req.body.data.receiver);
            if (idx > -1) { 
                following.followings.splice(idx, 1);
                new_following = following.followings;
            } 
        } 
    }).clone()
    await Following.findOneAndReplace({username: req.body.data.sender}, {username: req.body.data.sender, followings: new_following}).clone()

    let new_follower = [];
    await Follower.findOne({username: req.body.data.receiver}, function(err, follower){
        console.log('Debug: Remove viewer to viewed follower list')
        if (err) { 
            success = false;
        }
        if (follower) {
            new_follower = follower.followers;
            let idx = follower.followers.map(obj => obj.username).indexOf(req.body.data.sender);
            if (idx > -1) { 
                follower.followers.splice(idx, 1);
                new_follower = follower.followers;
            }
        } 
    }).clone()
    await Follower.findOneAndReplace({username: req.body.data.receiver}, {username: req.body.data.receiver, followers: new_follower}).clone()

    return res.json({
        status: success
    });
}

module.exports={
    isFriend,
    unfriending,
    unfollowing
}
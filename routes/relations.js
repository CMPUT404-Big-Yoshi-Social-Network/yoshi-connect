const { Follower, Following, Friend, Author } = require('../db_schema/author_schema.js');
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
        items: [author_scheme]
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
        await Friend.findOne({authorId: req.body.data.viewer}, function(err, friend){
            console.log('Debug: See if viewer is viewing someone they friended.')
            if (friend) {
                console.log('Debug: This viewer does friend people, but do they friend the viewed.')
                let idx = friend.items.map(obj => obj.authorId).indexOf(req.body.data.viewed);
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
    console.log('Debug: Viewer is unfriending the viewed.')
    let success = true;
    let new_friend_sender = [];

    const sender = await Author.findOne({_id: req.body.data.sender});
    const receiver = await Author.findOne({_id: req.body.data.receiver});

    await Friend.findOne({authorId: req.body.data.sender}, function(err, friend){
        console.log('Debug: Remove receiver from sender friend list.')
        if (friend) {
            console.log('Debug: We found sender friend list, now we need to delete receiver.')
            new_friend_sender = friend.items;
            let idx = friend.items.map(obj => obj.authorId).indexOf(req.body.data.receiver);
            if (idx > -1) { 
                friend.items.splice(idx, 1);
                new_friend_sender = friend.items;
            }                
        } 
    }).clone()
    await Friend.findOneAndReplace({authorId: req.body.data.sender}, {type: 'friends', authorId: req.body.data.sender, items: new_friend_sender}).clone()

    let new_friend_receiver = [];
    await Friend.findOne({authorId: req.body.data.receiver}, function(err, friend){
        console.log('Debug: Remove sender from receiver friend list.')
        if (friend) {
            console.log('Debug: We found receiver friend list, now we need to delete sender.')
            new_friend_receiver = friend.items;
            let idx = friend.items.map(obj => obj.authorId).indexOf(req.body.data.sender);
            if (idx > -1) { 
                friend.items.splice(idx, 1);
                new_friend_receiver = friend.items;
            }                
        } 
    }).clone()
    await Friend.findOneAndReplace({authorId: req.body.data.receiver}, {type: 'friends', authorId: req.body.data.receiver, items: new_friend_receiver}).clone()

    let new_following = [];
    await Following.findOne({authorId: req.body.data.receiver}, function(err, following){
        console.log('Debug: Add sender to receiver following list')
        if (following) {
            console.log('Debug: Receiver already has a following list, must add to existing list.')
            following.items.push(sender);
            new_following = following.items;
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
    if (new_following.length) {
        console.log('Debug: New following!')
        await Following.findOneAndReplace({authorId: req.body.data.receiver}, {type: 'followings', authorId: req.body.data.receiver, items: new_following}).clone()
    }

    let new_follower = [];
    await Follower.findOne({authorId: req.body.data.authorId}, function(err, follower){
        console.log('Debug: Add receiver to sender follower list')
        if (follower) {
            console.log('Debug: Sender already has a follower list, must add to existing list.')
            follower.items.push(receiver);
            new_follower = follower.items;
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
    if (new_follower.length) {
        console.log('Debug: New follower!')
        await Follower.findOneAndReplace({authorId: req.body.data.sender}, {type: 'followers', authorId: req.body.data.sender, items: new_follower}).clone()
    }

    return res.json({ status: success });
}

async function unfollowing(req, res) {
    console.log('Debug: Viewer is unfollowing the viewed.')

    let new_following = [];
    let success = true;

    await Following.findOne({authorId: req.body.data.sender}, function(err, following){
        console.log('Debug: Remove viewed to viewer following list')
        if (err) { success = false; }
        if (following) {
            new_following = following.items;
            let idx = following.items.map(obj => obj.authorId).indexOf(req.body.data.receiver);
            if (idx > -1) { 
                following.items.splice(idx, 1);
                new_following = following.items;
            } 
        } 
    }).clone()
    await Following.findOneAndReplace({authorId: req.body.data.sender}, {type: 'followings', authorId: req.body.data.sender, items: new_following}).clone()

    let new_follower = [];
    await Follower.findOne({authorId: req.body.data.receiver}, function(err, follower){
        console.log('Debug: Remove viewer to viewed follower list')
        if (err) { success = false; }
        if (follower) {
            new_follower = follower.items;
            let idx = follower.items.map(obj => obj.authorId).indexOf(req.body.data.sender);
            if (idx > -1) { 
                follower.items.splice(idx, 1);
                new_follower = follower.items;
            }
        } 
    }).clone()
    await Follower.findOneAndReplace({authorId: req.body.data.receiver}, {type: 'followers', authorId: req.body.data.receiver, items: new_follower}).clone()

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
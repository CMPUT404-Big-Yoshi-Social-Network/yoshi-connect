const { Request, Follower, Following, Friend, Login, Author } = require('../db_schema/author_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

async function saveRequest(req, res) {  
    const senderUUID = await Author.findOne({username: req.body.data.sender});
    const receiverUUID = await Author.findOne({username: req.body.data.receiver});

    var request = new Request({
        senderId: req.body.data.sender,
        senderUUID: senderUUID,
        receiverId: req.body.data.receiver,
        receiverUUID: receiverUUID,
        status: 'Stranger'
    });

    await request.save(async (err, author, next) => {
        if(err){
            console.log(err);
            return res.json({
                message: "You could not send a friend request (could not be saved in database).",
                status: "Unsuccessful"
            });
        } else {
            return res.json({
                message: "Request saved.",
                status: "Successful"
            });
        }
    });
}

async function deleteRequest(req, res) {
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
            console.log("Debug: Request does exist and was deleted.");
            return res.json({
                status: "Successful"
            });
        } else {
            return res.json({
                status: "Unsuccessful"
            });
        }
    }).clone()
}

async function findRequest(req, res) {
    await Request.findOne({sendId: req.body.data.sender, receiverId: req.body.data.receiver}, function(err, request){
        if(request){
            console.log("Debug: Request does exist.");
            return res.json({
                status: "Successful"
            });
        } else {
            return res.json({
                status: "Unsuccessful"
            });
        }
    }).clone()
}

async function findAllRequests(req, res) {
    let username = '';
    await Login.find({token: req.body.data.sessionId}, async function(err, login) {
        console.log('Debug: Retrieving current author logged in')
        username = login[0].username
        
        await Request.find({receiverId: username}, function(err, requests){
            console.log("Debug: Requests exists");
            console.log(requests)
            return res.json({
                requests: requests
            });
        }).clone()
    }).clone();
}

async function senderAdded(req, res) {
    console.log('Debug: Need to check if the receiver is already following the sender.')
    let friend = false; 
    await Following.findOne({username: req.body.data.receiver}, function(err, following){
        if (following) {
            console.log("Debug: Receiver has a following list. Now, we need to find the sender in their following list.");
            let idx = following.followings.map(obj => obj.username).indexOf(req.body.data.sender);
            if (idx > -1) { 
                friend = true;
            }
        } else {
            console.log('The Receiver does not currently have a following list (following no one).')
        }
        adding(friend, req, res);
    }).clone()
}

async function adding(friend, req, res) {
    let success = true;
    const senderUUID = await Author.findOne({username: req.body.data.sender});
    const receiverUUID = await Author.findOne({username: req.body.data.receiver});
    if (!friend) {
        console.log('Debug: Added as a follower.')

        let new_following = [];
        await Following.findOne({username: req.body.data.sender}, function(err, following){
            console.log('Debug: Add receiver to sender following list')
            if (following) {
                console.log('Debug: Sender already has a following list, must add to existing list.')
                following.followings.push({username: req.body.data.receiver, authorId: receiverUUID});

                new_following = following.followings;
            } else {
                console.log('Debug: Sender does not have a following list (has not followed anyone), must make one.')
                var following = new Following({
                    username: req.body.data.sender,
                    authorId: senderUUID,
                    followings: [{
                        username: req.body.data.receiver,
                        authorId: receiverUUID
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
            await Following.findOneAndReplace({username: req.body.data.sender}, {username: req.body.data.sender, authorId: senderUUID, followings: new_following}).clone()
        }

        let new_follower = [];
        console.log('Debug: Add sender to follower list.')
        await Follower.findOne({username: req.body.data.receiver}, function(err, follower){
            console.log('Debug: Add sender to receiver follower list')
            if (follower) {
                console.log('Debug: Receiver already has a follower list, must add to existing list.')
                follower.followers.push({username: req.body.data.sender, authorId: senderUUID});
                new_follower = follower.followers;
            } else {
                console.log('Debug: Receiver does not have a follower list (has no followers), must make one.')
                var follower = new Follower({
                    username: req.body.data.receiver,
                    authorId: receiverUUID,
                    followers: [{
                        username: req.body.data.sender,
                        authorId: senderUUID
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
            await Follower.findOneAndReplace({username: req.body.data.receiver}, {username: req.body.data.receiver, authorId: receiverUUID, followers: new_follower}).clone()
        }

        if (success) {
            console.log('Debug: Delete the request since it has been accepted.')
            await deleteRequest(req, res);
        } else {
            return res.json({
                status: "Unsuccessful"
            });
        }
    } else {
        console.log('Debug: These authors need to be added as friends.')
        let new_following = [];
        await Following.findOne({username: req.body.data.receiver}, function(err, following){
            console.log('Debug: Find sender from receiver following list.')
            if (following) {
                let idx = following.followings.map(obj => obj.username).indexOf(req.body.data.sender);
                if (idx > -1) { 
                    following.followings.splice(idx, 1);
                    new_following = following.followings;
                }
            }
        }).clone()
        await Following.findOneAndReplace({username: req.body.data.receiver}, {username: req.body.data.receiver, followings: new_following}).clone()

        let new_follower = [];
        await Follower.findOne({username: req.body.data.sender}, function(err, follower){
            console.log('Debug: Remove receiver from sender follower list.')
            if (follower) {
                console.log('Debug: We found sender follower list, now we need to delete receiver.')
                let idx = follower.followers.map(obj => obj.username).indexOf(req.body.data.receiver);
                if (idx > -1) { 
                    follower.followers.splice(idx, 1);
                    new_follower = follower.followers;
                }                
            } 
        }).clone()
        await Follower.findOneAndReplace({username: req.body.data.sender}, {username: req.body.data.sender, followers: new_follower}).clone()

        let new_friend_receiver = [];
        await Friend.findOne({username: req.body.data.receiver}, function(err, friend){
            console.log('Debug: Add sender to receiver friend list.')
            if (friend) {
                console.log('Debug: Receiver has friend list.')
                friend.friends.push({username: req.body.data.sender, authorId: senderUUID});
                new_friend_receiver = friend.friends;
            } else {
                console.log('Debug: Receiver does not have a friend list yet.')
                var new_friend = new Friend({
                    username: req.body.data.receiver,
                    authorId: receiverUUID,
                    friends: [{
                        username: req.body.data.sender,
                        authorId: senderUUID
                    }]
                });
    
                new_friend.save(async (err, friend, next) => {
                    if(err){
                        console.log(err);
                        success = false;
                    }
                })
            }
        }).clone()
        if (new_friend_receiver.length) {
            await Friend.findOneAndReplace({username: req.body.data.receiver}, {username: req.body.data.receiver, authorId: receiverUUID, friends: new_friend_receiver}).clone()
        }

        let new_friend_sender = [];
        await Friend.findOne({username: req.body.data.sender}, function(err, friend){
            console.log('Debug: Add receiver to sender friend list.')
            if (friend) {
                console.log('Debug: Sender has friend list.')
                friend.friends.push({username: req.body.data.receiver, authorId: receiverUUID});
                new_friend_sender = friend.friends;
            } else {
                console.log('Debug: Sender does not have a friend list yet.')
                var new_friend = new Friend({
                    username: req.body.data.sender,
                    authorId: senderUUID,
                    friends: [{
                        username: req.body.data.receiver,
                        authorId: receiverUUID
                    }]
                });
    
                new_friend.save(async (err, friend, next) => {
                    if(err){
                        console.log(err);
                        success = false;
                    }
                })
            }
        }).clone()
        if (new_friend_sender.length) {
            await Friend.findOneAndReplace({username: req.body.data.sender}, {username: req.body.data.sender, authorId: senderUUID, friends: new_friend_sender}).clone();
        }

        if (success) {
            console.log('Debug: Delete the request since it has been accepted.')
            await deleteRequest(req, res);
        } else {
            return res.json({
                status: "Unsuccessful"
            });
        }

    }
}

module.exports={
    saveRequest,
    deleteRequest,
    findRequest,
    findAllRequests,
    senderAdded
}
const { request_scheme, follower_scheme, following_scheme, friend_scheme } = require('../db_schema/author_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;
const Request = database.model('Request', request_scheme);
const Follower = database.model('Follower', follower_scheme);
const Following = database.model('Following', following_scheme);
const Friend = database.model('Friend', friend_scheme);

async function saveRequest(req, res) {
    var request = new Request({
        senderId: req.body.data.sender,
        receiverId: req.body.data.receiver,
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
    await Request.find({receiverId: req.body.data.receiver}, function(err, requests){
        if(requests){
            console.log("Debug: Requests exists");
            return res.json({
                requests: requests
            });
        } else {
            return res.json({
                requests: null
            });
        }
    }).clone()
}

async function senderAdded(req, res) {
    console.log('Debug: Need to check if the receiver is already following the sender.')
    let friend = false; 
    await Following.findOne({username: req.body.data.receiver}, function(err, following){
        if (following) {
            console.log("Debug: Receiver has a following list. Now, we need to find the sender in their following list.");
            for (let i = 0; i < following.followings.length; i++) {
                if (following.followings[i].username === req.body.data.sender) {
                    console.log('Debug: They must be added as friends.')
                    friend = true;
                    break
                } 
            }
        } else {
            console.log('The Receiver does not currently have a following list (following no one).')
        }
        adding(friend, req, res);
    }).clone()
}

async function adding(friend, req, res) {
    if (!friend) {
        console.log('Debug: Added as a follower.')
        let success = true;

        await Following.findOne({username: req.body.data.sender}, function(err, following){
            console.log('Debug: Add receiver to sender following list')
            if (following) {
                console.log('Debug: Sender already has a following list, must add to existing list.')
                // TODO: Add to existing list 
            } else {
                console.log('Debug: Sender does not have a following list (has not followed anyone), must make one.')
                var following = new Following({
                    username: req.body.data.sender,
                    followings: [{
                        username: req.body.data.receiver,
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

        console.log('Debug: Add sender to follower list.')
        await Follower.findOne({username: req.body.data.receiver}, function(err, follower){
            console.log('Debug: Add sender to receiver follower list')
            if (follower) {
                console.log('Debug: Receiver already has a follower list, must add to existing list.')
                // TODO: Add to existing list 
            } else {
                console.log('Debug: Receiver does not have a follower list (has no followers), must make one.')
                var follower = new Follower({
                    username: req.body.data.receiver,
                    followers: [{
                        username: req.body.data.sender,
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

        if (success) {
            console.log('Debug: Delete the request since it has been accepted.')
            await deleteRequest(req, res);
        } else {
            return res.json({
                status: "Unsuccessful"
            });
        }
    } else {
        console.log('Debug: These authors need to be added as friends!')
        // TODO: Adding as friends functionality
    }
}

module.exports={
    saveRequest,
    deleteRequest,
    findRequest,
    findAllRequests,
    senderAdded
}
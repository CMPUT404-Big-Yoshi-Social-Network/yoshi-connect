const { Request, Follower, Following, Friend, Login, Author } = require('../db_schema/author_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

async function saveRequest(req, res) {  
    const sender = await Author.findOne({_id: req.body.data.sender});
    const receiver = await Author.findOne({_id: req.body.data.receiver});

    console.log('Debug: See if receiver is following sender (meaning request is friends)')
    let type = 'follow';
    await Following.findOne({authorId: req.body.data.receiver}, function(err, following){
        console.log('Debug: See if viewer is viewing someone they follow.')
        if (following) {
            console.log('Debug: This viewer does follow people, but do they follow the viewed.')
            let idx = following.items.map(obj => obj.authorId).indexOf(req.body.data.sender);
            if (idx > -1) { 
                type = 'friend';
            }
        } 
    }).clone()

    var request = new Request({
        type: type,
        summary: sender.displayName + ' wants to ' + type + ' ' + receiver.displayName, 
        actor: sender,
        object: receiver
    });

    request.save(async (err, request, next) => {
        if(err){
            console.log(err);
            return res.json({ status: "Unsuccessful" });
        } else {
            return res.json({ status: "Successful" });
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
    await Request.deleteOne({'actor._id': sender, 'object._id': receiver}, function(err, request){
        if (request) {
            console.log("Debug: Request does exist and was deleted.");
            return res.json({ status: "Successful" });
        } else {
            return res.json({ status: "Unsuccessful" });
        }
    }).clone()
}

async function findRequest(req, res) {
    await Request.findOne({'actor._id': req.body.data.sender, 'object._id': req.body.data.receiver}, function(err, request) {
        if (request) {
            console.log("Debug: Request does exist.");
            return res.json({ status: "Successful" });
        } else {
            return res.json({ status: "Unsuccessful" });
        }
    }).clone()
}

async function findAllRequests(req, res) {
    let authorId = '';
    await Login.findOne({token: req.body.data.sessionId}, async function(err, login) {
        console.log('Debug: Retrieving current author logged in')
        authorId = login.authorId
        
        await Request.find({'object._id': authorId}, function(err, requests){
            console.log("Debug: Requests exists");
            return res.json({ requests: requests });
        }).clone()
    }).clone();
}

async function senderAdded(req, res) {
    console.log('Debug: Need to check if the receiver is already following the sender.')
    let friend = false; 
    await Following.findOne({authorId: req.body.data.receiver}, function(err, following){
        if (following) {
            console.log("Debug: Receiver has a following list. Now, we need to find the sender in their following list.");
            let idx = following.items.map(obj => obj.authorId).indexOf(req.body.data.sender);
            if (idx > -1) { friend = true; }
        } else { console.log('The Receiver does not currently have a following list (following no one).') }
        adding(friend, req, res);
    }).clone()
}

async function adding(friend, req, res) {
    let success = true;
    const sender = await Author.findOne({_id: req.body.data.sender});
    const receiver = await Author.findOne({_id: req.body.data.receiver});

    if (!friend) {
        console.log('Debug: Added as a follower.')

        let new_following = [];
        await Following.findOne({authorId: req.body.data.sender}, function(err, following){
            console.log('Debug: Add receiver to sender following list')
            if (following) {
                console.log('Debug: Sender already has a following list, must add to existing list.')
                following.items.push(receiver);
                new_following = following.items;
            } else {
                console.log('Debug: Sender does not have a following list (has not followed anyone), must make one.')
                var following = new Following({
                    type: 'followings',
                    authorId: req.body.data.sender,
                    items: [receiver]
                });
    
                following.save(async (err, following, next) => {
                    if (err) { success = false; }
                })
            }
        }).clone()
        if (new_following.length) {
            await Following.findOneAndReplace({authorId: req.body.data.sender}, {type: 'followings', authorId: req.body.data.sender, items: new_following}).clone()
        }

        let new_follower = [];
        console.log('Debug: Add sender to follower list.')
        await Follower.findOne({authorId: req.body.data.receiver}, function(err, follower){
            console.log('Debug: Add sender to receiver follower list')
            if (follower) {
                console.log('Debug: Receiver already has a follower list, must add to existing list.')
                follower.items.push(sender);
                new_follower = follower.items;
            } else {
                console.log('Debug: Receiver does not have a follower list (has no followers), must make one.')
                var follower = new Follower({
                    type: 'followers',
                    authorId: req.body.data.receiver,
                    items: [sender]
                });
                follower.save(async (err, follower, next) => {
                    if (err) { success = false; }
                })
            }
        }).clone()
        if (new_follower.length) {
            await Follower.findOneAndReplace({authorId: req.body.data.receiver}, {type: 'followers', authorId: req.body.data.receiver, items: new_follower}).clone()
        }

        if (success) {
            console.log('Debug: Delete the request since it has been accepted.')
            await deleteRequest(req, res);
        } else {
            return res.json({ status: "Unsuccessful" });
        }
    } else {
        console.log('Debug: These authors need to be added as friends.')
        let new_following = [];
        await Following.findOne({authorId: req.body.data.receiver}, function(err, following){
            console.log('Debug: Find sender from receiver following list.')
            if (following) {
                let idx = following.items.map(obj => obj.authorId).indexOf(req.body.data.sender);
                if (idx > -1) { 
                    following.items.splice(idx, 1);
                    new_following = following.items;
                }
            }
        }).clone()
        await Following.findOneAndReplace({authorId: req.body.data.receiver}, {type: 'followings', authorId: req.body.data.receiver, items: new_following}).clone()

        let new_follower = [];
        await Follower.findOne({authorId: req.body.data.sender}, function(err, follower){
            console.log('Debug: Remove receiver from sender follower list.')
            if (follower) {
                console.log('Debug: We found sender follower list, now we need to delete receiver.')
                let idx = follower.items.map(obj => obj.authorId).indexOf(req.body.data.receiver);
                if (idx > -1) { 
                    follower.items.splice(idx, 1);
                    new_follower = follower.items;
                }                
            } 
        }).clone()
        await Follower.findOneAndReplace({authorId: req.body.data.sender}, {type: 'followers', authorId: req.body.data.sender, items: new_follower}).clone()

        let new_friend_receiver = [];
        await Friend.findOne({authorId: req.body.data.receiver}, function(err, friend){
            console.log('Debug: Add sender to receiver friend list.')
            if (friend) {
                console.log('Debug: Receiver has friend list.')
                friend.items.push(sender);
                new_friend_receiver = friend.items;
            } else {
                console.log('Debug: Receiver does not have a friend list yet.')
                var new_friend = new Friend({
                    type: 'friends',
                    authorId: req.body.data.receiver,
                    items: [sender]
                });
    
                new_friend.save(async (err, friend, next) => {
                    if(err){ success = false; }
                })
            }
        }).clone()
        if (new_friend_receiver.length) {
            await Friend.findOneAndReplace({authorId: req.body.data.receiver}, {type: 'friends', authorId: req.body.data.receiver, items: new_friend_receiver}).clone()
        }

        let new_friend_sender = [];
        await Friend.findOne({authorId: req.body.data.sender}, function(err, friend){
            console.log('Debug: Add receiver to sender friend list.')
            if (friend) {
                console.log('Debug: Sender has friend list.')
                friend.items.push(receiver);
                new_friend_sender = friend.items;
            } else {
                console.log('Debug: Sender does not have a friend list yet.')
                var new_friend = new Friend({
                    type: 'friends',
                    authorId: req.body.data.sender,
                    items: [receiver]
                });
    
                new_friend.save(async (err, friend, next) => {
                    if (err) { success = false; }
                })
            }
        }).clone()
        if (new_friend_sender.length) {
            await Friend.findOneAndReplace({authorId: req.body.data.sender}, {type: 'friends', authorId: req.body.data.sender, items: new_friend_sender}).clone();
        }

        if (success) {
            console.log('Debug: Delete the request since it has been accepted.')
            await deleteRequest(req, res);
        } else {
            return res.json({ status: "Unsuccessful" });
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
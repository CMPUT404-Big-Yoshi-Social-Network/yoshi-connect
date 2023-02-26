const { request_scheme } = require('../db_schema/author_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;
const Request = database.model('Request', request_scheme);

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
    await Request.deleteOne({sendId: req.body.sender, receiverId: req.body.receiver}, function(err, request){
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

module.exports={
    saveRequest,
    deleteRequest,
    findRequest,
    findAllRequests
}
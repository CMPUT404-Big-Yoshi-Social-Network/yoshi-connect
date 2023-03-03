const { friend_scheme, login_scheme} = require('../db_schema/author_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;
const Friend = database.model('Friend', friend_scheme);
const Login = database.model('Login', login_scheme);

async function fetchFriends(req, res) {
    let username = '';
    await Login.find({token: req.body.data.sessionId}, function(err, login) {
        console.log('Debug: Retrieving current author logged in')
        username = login[0].username
    }).clone();

    await Friend.find({username: username}, function(err, friends){
        console.log("Debug: Friends exists");
        if (friends != []) {
            return res.json({
                friends: friends[0].friends
            });
        }
    }).clone()
}

module.exports={
    fetchFriends
}
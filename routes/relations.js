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
                    status = 'Friends';
                } 
            } 
        }).clone()
    }
    return res.json({
        status: status
    });
}

module.exports={
    isFriend
}
const { friend_scheme, login_scheme } = require('../db_schema/author_schema.js');
const { post_history_scheme } = require('../db_schema/post_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;
const Friend = database.model('Friend', friend_scheme);
const Login = database.model('Login', login_scheme);
const PostHistory = database.model('Posts', post_history_scheme);

async function fetchFriends(req, res) {
    const login = await Login.findOne({token: req.cookies.token}).clone();
    if(!login){
        return res.sendStatus(404);
    }

    const username = login.username;
    await Friend.findOne({username: username}, function(err, friends){
        console.log("Debug: Friends exists");
        if(friends == undefined){
            return res.json({
                friends: []
            });
        }

        return res.json({
            friends: friends.friends
        })
    }).clone();
}

async function fetchFriendPosts(req, res) {
    console.log('Debug: Getting friends posts');
    const login = await Login.findOne({token: req.cookies.token}).clone();
    if (!login) { return res.sendStatus(404); }

    console.log('Debug: Retrieving current author logged in')
    const username = login.username
    const friend = await Friend.aggregate([
        {
            $match: {'username': username} 
        },
        {
            $unwind: '$friends'
        },
        {
            $project: {
                "friends.authorId": 1
            }
        },
        {
            $group: {
                _id: null,
                friends: { $addToSet: "$friends.authorId"}
            }
        },
    ]);

    let friends = [];
    if(friend.length > 0){
        friends = friend[0].friends;
    }
    
    if(friends.length == 0){
        return res.json({
            friendPosts: []
        });
    }

    const posts = await PostHistory.aggregate([
        {
            $match: {
                $expr: {
                    $in : ["$authorId", friends]
                }
            },
        },
        {
            $unwind: "$posts"
        },
        {
            $set: {
                "posts.published": {
                    $dateFromString: {
                        dateString: "$posts.published"
                    }
                }
            }
        },
        {
            $sort: {"posts.published": -1}
        },
        {
            $group: {
                _id: null,
                posts_array: {$push: "$posts"}
            }
        },
    ]);

    return res.json({
        friendPosts: posts[0].posts_array
    });
}

module.exports={
    fetchFriends,
    fetchFriendPosts
}
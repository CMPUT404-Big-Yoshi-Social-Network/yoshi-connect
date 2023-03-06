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
const { Friend, Login, Follower } = require('../db_schema/authorScheme.js');
const { PostHistory } = require('../db_schema/postScheme.js');

async function fetchFriends(req, res) {
    /**
     * Description: Fetches all the friends of a specific author 
     * Returns: Status 404 if the login document does not exist 
     *          If the author does not have any friends, then the client will receive an empty list, else it will receive the friends
     */
    const login = await Login.findOne({token: req.cookies.token}).clone();
    if(!login){ return res.sendStatus(404); }

    const username = login.username;
    await Friend.findOne({username: username}, function(err, friends){
        if(friends == undefined){ return res.json({ friends: [] }); }
        return res.json({ friends: friends.friends })
    }).clone();
}

async function fetchFriendPosts(req, res) {
    /**
     * Description: Fetches the author's friends' posts to display in their friends feed.
     *              We aggregate and $match using the author's username, then we $unwind their friends objects and $project their 
     *              friends' authorIds. Lastly, we then $group these friends and push them to an array. We then aggregate again to get
     *              the friends' posts by $match their authorIds we got previously, then $unwinding these posts and removing anything
     *              that is not listed post (unlisted=true). We then $set the date, store the authorId alongside the post, $sort by
     *              their publishing date, and lastly, $group to have them pushed into a array we send to the client.
     * Returns: Status 404 if the login document does not exist 
     *          If the aggregate returns an empty array of friends or posts, then we return empty array representing friends' posts. 
     *          If successful, the array of friends' posts will be send to the client. 
     */
    const login = await Login.findOne({token: req.cookies.token}).clone();
    if (!login) { return res.sendStatus(404); }

    const username = login.username

    const friend = await Friend.aggregate([
        {
            $match: {'username': username} 
        },
        {
            $unwind: '$friends'
        },
        {
            $project: { "friends.authorId": 1 }
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
    } else {
        return res.json({ friendPosts: [] });
    }

    const posts = await PostHistory.aggregate([
        {
            $match: { $expr: { $in : ["$authorId", friends] } },
        },
        {
            $unwind: "$posts"
        },
        {
            $match: { $expr: { $ne: ["$unlisted", true] } }
        },
        {
            $set: { "posts.published": { $dateFromString: { dateString: "$posts.published" } } }
        },
        {
            $addFields: { "posts.authorId": "$authorId" }
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
    if(!posts){ 
        return res.json({ friendPosts: [] });
    } else {
        return res.json({ friendPosts: posts[0].posts_array });
    }
}


/**
 * API STUFF
 */

async function getFollowers(id){
    const followers = await Follower.findOne({authorId: id});

    if(!followers)
        return 404;
        
    return followers.followers;
}

async function getFriends(id){
    const friends = await Friend.findOne({authorId: id});

    if(!friends)
        return 404;

    return friends.friends;
}
module.exports={
    fetchFriends,
    fetchFriendPosts,
    getFollowers,
    getFriends
}
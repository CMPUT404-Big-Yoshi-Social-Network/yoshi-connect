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

const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

// Schemas
const { PostHistory, PublicPost } = require('../scheme/post.js');
const { LikeHistory, LikedHistory } = require('../scheme/interactions.js');
const { Author } = require('../scheme/author.js');

// UUID
const crypto = require('crypto');

// Additional Functions
const { authLogin } = require('./auth.js');


async function getLikes(authorId, postId, commentId, type){
    let objectId;
    if(type == "comment"){
        objectId = commentId;
    }
    else if(type == "post"){
        objectId = postId;
    }
    else{
        return [{}, 400];
    }

    let likes = await LikeHistory.findOne({Id: objectId, type: type}).clone();
    if(!likes){
        return [{}, 404];
    }
    likes = likes.likes;
    
    const object = (type == "comment") ? "authors/" + authorId + "/posts/" + postId + "/comments/" + commentId : "authors/" + authorId + "/posts/" + postId;
    let sanitizedLikes = [];
    for(let i = 0; i < likes.length; i++){
        let liker = likes[i];

        let author = {
            "id": liker._id,
            "host": liker.host,
            "displayName": liker.displayName,
            "url": liker.url,
            "github": liker.github,
            "profileImage": liker.profileImage
        }

        let sanitizedLike = {
            "@context": "https://www.w3.org/ns/activitystreams",
            summary: liker.displayName + " likes your post",
            type: "like",
            author: author,
            object: process.env.DOMAIN_NAME + object 
        };

        sanitizedLikes.push(sanitizedLike);
    }

    return [{sanitizedLikes}, 200];
}

async function addLike(like, author){
    const type = like.type;
    const summary = like.summary;
    let object = like.object;

    if(!type || !summary || !object){
        return [{}, 400];
    }
    if(type != "like"){
        return [{}, 400];
    }

    object = object.split("/");
    let objectType = object[object.length - 2];
    let Id = object[object.length - 1];

    let likes;
    if(objectType == "comments"){
        //Add a like to a comment document
        likes = await LikeHistory.findOne({type: "comment", Id: Id}).clone();
    }
    if(objectType == "posts"){
        //Add a like to a post document
        likes = await LikeHistory.findOne({type: "post", Id: Id}).clone();
    }
    else{ return [{}, 400]; }

    likes.likes.push(author);
    await likes.save();
    return [{}, 200];
}

async function addLiked(authorId, objectId){
    //Add this object to the list of posts that the author has liked
    //extract author uuid from authorID
    let authorUUID = authorId.split("/")
    authorUUID = authorUUID[authorUUID.length - 1]; 
    const liked = await LikedHistory.findOne({authorId: authorUUID});
    if(!liked){
        return;
    }

    let object = objectId.split("/");
    let type = object[object.length - 2];
    
    liked.liked.push({type: (type == "posts") ? "post" : "comment", _id: objectId});
    liked.numObjects++;
    await liked.save();
    return;
}

//TODO Refactor this to work
async function deleteLike(req, res){
    let success = false;
    let numLikes = 0;
    let publicPost = await PublicPost.find();
    await PostHistory.findOne({authorId: req.body.authorId}, async function(err, history){
        if (history) {
            let post_idx = history.posts.map(obj => obj._id).indexOf(req.body.postId);
            if (post_idx > -1) { 
                let like_idx = history.posts[post_idx].likes.map(obj => obj._id).indexOf(req.body.likeId);
                history.posts[post_idx].likes.splice(like_idx, 1);
                await history.save();
                success = true;

                for (let i = 0; i < publicPost[0].posts.length; i++) {
                    if (publicPost[0].posts[i].post._id === req.body.data.postId) {
                        let like_idx = publicPost[0].posts[i].likes.map(obj => obj._id).indexOf(req.body.likeId);
                        publicPost[0].posts[i].likes.splice(like_idx, 1);
                        numLikes = publicPost[0].posts[i].likes.length;
                        await publicPost[0].save();
                    }
                }
            }
        }
    }).clone()
 
    return res.json({
        status: success,
        numLikes: numLikes
    })
}

//TODO Delete the liked
async function deleteLiked(objectId){
    
}

async function fetchCommentLikes(authorId, postId, commentId) {
    // TODO Paging
    const comments = getPost(authorId, postId).comments; 
    let comment = null;

    for (let i = 0; i < comments.length; i++) {
        if (comments[i]._id === commentId) {
            comment = comments[i];
            break;
        }
    }

    return comment.likes;
}

async function hasLiked(authorId, res) {
    const history = await LikedHistory.findOne({authorId: authorId});
    for (let i = 0; i < likers.length; i++) {
        if (likers[i].liker === req.body.data.viewerId) {
            return res.json({ status: 'liked' })
        }
    }
    return res.json({ status: 'unliked' })
}


async function fetchLikes(authorId, postId) {
    // TODO: Paginate
    const posts = PostHistory.find(
        {
            $match: {'authorId': authorId}
        },
        {
            $unwind: '$posts'
        },
        {
            index: { $indexOfArray: ['_id', postId] }
        },
        {
            $group: {
                _id: null,
                post_array: { $push: "$index" }
            }
        }
    )

    if (posts[0] != undefined) {
        return posts[0].post_array.likes;
    } else {
        return [];
    }   
}

async function getAuthorLikes(authorId) { 
    return await Liked.findOne({authorId: authorId}); 
}

module.exports = {
    getLikes,
    addLike,
    addLiked
}
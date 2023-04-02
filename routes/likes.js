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
const { LikeHistory, LikedHistory, CommentHistory } = require('../scheme/interactions.js');
const { Author } = require('../scheme/author.js');

// UUID
const crypto = require('crypto');

// Additional Functions
const { authLogin } = require('./auth.js');


async function getLikes(authorId, postId, commentId, type){
    /**
    Description: Gets the likes associated with a specific post / comment made by a specific author
    Associated Endpoint: /authors/:authorId/posts/:postId/comments/:commentId/likes
                         /authors/:authorId/posts/:postId/likes
    Request Type: GET
    Request Body: { Id: 902sq546w5498hea764r80re0z89bej, type: type }
    Return: 400 Status (Bad Request) -- Invalid type given
            404 Status (Not Found) -- No likes for the specific Post / Comment exists
            200 Status (OK) -- Returns the sanitized likes
                                        { "@context": "https://www.w3.org/ns/activitystreams",
                                            summary: "abc likes your post",
                                            type: "Like",
                                            author: author,
                                            object: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb/posts/902sq546w5498hea764r80re0z89becb/comments/6d45f566w5498e78tgy436h48dh96a : authors/29c546d45f564a27871838825e3dbecb /posts/902sq546w5498hea764r80re0z89becb }
    */
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
            "type": "author",
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
            type: "Like",
            author: author,
            object: process.env.DOMAIN_NAME + object 
        };

        sanitizedLikes.push(sanitizedLike);
    }

    return [sanitizedLikes, 200];
}

async function addLike(like, authorId, postId){
    /**
    Description: Adds a like to the associated author's post / comment
    Associated Endpoint: N/A
    Request Type: POST
    Request Body: N/A
    Return: 400 Status (Bad Request) -- Invalid type given
            200 Status (OK) -- Successfully added a like to post /comment
    */
    const type = like.type;
    const summary = like.summary;
    let object = like.object;
    const author = like.author;

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
        let postId = object[object.length - 3];
        likes = await LikeHistory.findOne({type: "comment", Id: Id}).clone();
        let commentHistory = await CommentHistory.findOne({postId: postId});
        let comment = commentHistory.comments.id(Id);
        comment.likeCount++;
        await commentHistory.save();
    }
    else if(objectType == "posts"){
        //Add a like to a post document
        likes = await LikeHistory.findOne({type: "post", Id: Id}).clone();
        let postHistory = await PostHistory.findOne({authorId: authorId});
        let post = postHistory.posts.id(Id);
        post.like_count++;
        await postHistory.save();
    }
    else{ return [{}, 400]; }

    

    likes.likes.push(author);
    await likes.save();
    return [{}, 200];
}

async function addLiked(authorId, objectId){
    /**
    Description: 
    Associated Endpoint: N/A
    Request Type: POST
    Request Body: { _id: 902sq546w5498hea764r80re0z89bej }
    Return: N/A
    */
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
    /**
    Description: 
    Associated Endpoint: (for example: /authors/:authorid)
    Request Type: 
    Request Body: (for example: { username: kc, email: 123@aulenrta.ca })
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
    */
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
    /**
    Description: 
    Associated Endpoint: (for example: /authors/:authorid)
    Request Type: 
    Request Body: (for example: { username: kc, email: 123@aulenrta.ca })
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
    */
    
}

async function fetchCommentLikes(authorId, postId, commentId) {
    /**
    Description: 
    Associated Endpoint: (for example: /authors/:authorid)
    Request Type: 
    Request Body: (for example: { username: kc, email: 123@aulenrta.ca })
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
    */
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
    /**
    Description: 
    Associated Endpoint: (for example: /authors/:authorid)
    Request Type: 
    Request Body: (for example: { username: kc, email: 123@aulenrta.ca })
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
    */
    const history = await LikedHistory.findOne({authorId: authorId});
    for (let i = 0; i < likers.length; i++) {
        if (likers[i].liker === req.body.data.viewerId) {
            return res.json({ status: 'liked' })
        }
    }
    return res.json({ status: 'unliked' })
}


async function fetchLikes(authorId, postId) {
    /**
    Description: 
    Associated Endpoint: (for example: /authors/:authorid)
    Request Type: 
    Request Body: (for example: { username: kc, email: 123@aulenrta.ca })
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
    */
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
    /**
    Description: 
    Associated Endpoint: (for example: /authors/:authorid)
    Request Type: 
    Request Body: (for example: { username: kc, email: 123@aulenrta.ca })
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
    */
    return await Liked.findOne({authorId: authorId}); 
}

module.exports = {
    getLikes,
    addLike,
    addLiked
}
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
const { OutgoingCredentials } = require('../scheme/server.js');
const axios = require('axios');

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
                                            object: https://yoshi-connect.herokuapp.com/f08d2d6579d5452ab282512d8cdd10d4 }
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
        // Must be remote
        const outgoings = await OutgoingCredentials.find().clone();
        for (let i = 0; i < outgoings.length; i++) {
            if (outgoings[i].allowed) {     
                var config = {
                    host: outgoings[i].url,
                    url: outgoings[i].url + '/authors/' + authorId + '/' + type + 's/' + postId + '/likes',
                    method: 'GET',
                    headers: {
                        'Authorization': outgoings[i].auth,
                        'Content-Type': 'application/json'
                    }
                };
                await axios.request(config)
                .then( res => { 
                    likes = res.data.items
                })
                .catch( error => { })
                if (likes) {
                    break
                }
            }
        }
        return [likes, 200];
    } else {
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
    const type = like.type.toLowerCase();
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
        comment.likeCount + 1;
        await commentHistory.save();
    }
    else if(objectType == "posts"){
        likes = await LikeHistory.findOne({type: "post", Id: Id}).clone();
        let postHistory = await PostHistory.findOne({authorId: authorId});
        if (postHistory === null) {
            return 'Remote';
        }
        let post = postHistory.posts.id(Id);
        post.likeCount + 1;
        await postHistory.save();

        if(post.visibility === "PUBLIC" && (post.unlisted === "false" || post.unlisted === false)){
            let publicPost = await PublicPost.findOne({postId: postId});
            if(publicPost){
                publicPost.likeCount + 1;
                await publicPost.save();
            }
        }

    }
    else{ return [{}, 400]; }

    

    likes.likes.push(author);
    await likes.save();
    return [{}, 200];
}

async function addLiked(authorId, objectId){
    /**
    Description: Saves a like associated with a specific post / comment
    Associated Endpoint: N/A
    Request Type: POST
    Request Body: { _id: 902sq546w5498hea764r80re0z89bej }
    Return: N/A
    */
    //Add this object to the list of posts that the author has liked
    //extract author uuid from authorID
    let authorUUID = authorId.split("/authors/")[1]
    const liked = await LikedHistory.findOne({authorId: authorUUID});
    if (!liked) { 
        // Remote author then who is liking
        return false; 
    }
    if(liked.liked.id(objectId)){
        return true;
    }
    let object = objectId.split("/");
    let type = object[object.length - 2];
    
    liked.liked.push({type: (type == "posts") ? "post" : "comment", _id: objectId});
    liked.numObjects++;
    await liked.save();
    return false;
}

module.exports = {
    getLikes,
    addLike,
    addLiked
}
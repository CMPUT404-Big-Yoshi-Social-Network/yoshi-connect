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
const { PostHistory, PublicPost, Inbox } = require('../scheme/post.js');
const { CommentHistory, LikeHistory } = require('../scheme/interactions.js');
const { Author } = require('../scheme/author.js');
const {Follower } = require('../scheme/relations.js');

// UUID
const crypto = require('crypto');

// Additional Functions
const { authLogin, checkExpiry } = require('./auth.js');


async function getComments(postId, authorId, page, size) {
    /**
    Description: Gets a paginated list of comments for a specific post (dictated by size and page queries)
    Associated Endpoint: /authors/:authorId/posts/:postId/comments
    Request Type: GET
    Request Body: { authorId: 29c546d45f564a27871838825e3dbecb, postId: 902sq546w5498hea764r80re0z89becb}
    Return: 404 Status (Not Found) -- Comments for specific post were not found
            200 Status (OK) -- Successfully fetched and sanitized comments for a specific post from the database
                                    { type: "comments",
                                        author: author,
                                        comment: 'abc',
                                        contentType: text/plain,
                                        published: 2023-03-24T06:53:47.567Z,
                                        id: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb/posts/f08d2d6579d5452ab282512d8cdd10d4/comments }
    */
    let comments = undefined
    //TODO Avoid duplicated code by using a list of objects and modifying them before sending
    if(page > 1){
        comments = await CommentHistory.aggregate([
            {
                $match: {'postId': postId}
            },
            {
                $unwind: '$comments'
            },
            {
                $set: {
                    "comments.published": {
                        $dateFromString: { dateString: "$comments.published" }
                    }
                }
            },
            {
                $sort: { "comment.published": -1 }
            },
            {
                $skip: (page - 1) * size
            },
            {
                $limit: size
            },
            {
                $group: {
                    _id: null,
                    comments_array: { $push: "$comments" }
                }
            },
        ]);
    } else if (page == 1) {
        comments = await CommentHistory.aggregate([
            {
                $match: {'postId': postId}
            },
            {
                $unwind: '$comments'
            },
            {
                $set: {
                    "comments.published": {
                        $dateFromString: { dateString: "$comments.published" }
                    }
                }
            },
            {
                $sort: { "comments.published": -1 }
            },
            {
                $limit: size
            },
            {
                $group: {
                    _id: null,
                    comments_array: { $push: "$comments" }
                }
            }
        ]);
    } else{
        return [[], 404];
    }

    if(!comments || !comments[0] || !comments[0].comments_array){
        return [[], 404];
    }

    comments = comments[0].comments_array;
    for(let i = 0; i < comments.length; i++){
        comment = comments[i];
        let author = comment.author;
        author = {
            type: "author",
            id: author._id,
            url: author.url,
            host: author.host,
            displayName: author.displayName,
            github: author.github,
            profileImage: author.profileImage
        }
        comments[i] = {
            type: "comments",
            author: author,
            comment: comment.comment,
            contentType: comment.contentType,
            published: comment.published,
            id: process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId + "/comments/" + comment._id
        }
    }

    return [comments, 200];
}

async function getComment(authorId, postId, commentId, token) {
    /**
    Description: Gets a specific Comment from a specific Post made by a specific Author
    Associated Endpoint: /authors/:authorId/posts/:postId/comments/:commentId
    Request Type: GET
    Request Body: { authorId: 29c546d45f564a27871838825e3dbecb, postId: 902sq546w5498hea764r80re0z89bej, commentId: 6d45f566w5498e78tgy436h48dh96a }
    Return: 404 Status (Not Found) -- Could not find any comment with the specific comment Id
            200 Status (OK) -- Successfully fetched and sanitized comment associated with comment Id
                                    { type: "comments",
                                        author: author,
                                        comment: 'abc',
                                        contentType: text/plain,
                                        published: 2023-03-24T06:53:47.567Z,
                                        id: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb/posts/f08d2d6579d5452ab282512d8cdd10d4/comments/c890c904cbd14fee8644f1ab7b7fb66b }
    */
    const postHistory = await PostHistory.findOne({authorId: authorId});
    const commentHistory = await CommentHistory.findOne({postId: postId});

    if(!postHistory || !commentHistory){
        return [{}, 404];
    }

    //TODO check visibility

    const comment = commentHistory.comments.id(commentId);
    

    let sanitizedComment = {
        type: "comment",
        author: comment.author,
        comment: comment.comment,
        contentType: comment.contentType,
        published: comment.published,
        id: process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId + "/comments/" + comment._id
    }

    return [sanitizedComment, 200];
}

async function createComment(token, authorId, postId, newComment) {
    /**
    Description: Creates comment for a specific Post made by a specific Author
    Associated Endpoint: /authors/:authorId/posts/:postId/comments
    Request Type: PUT
    Request Body: { _id: 29c546d45f564a27871838825e3dbecb, token: 5yy7bCMPrSXSv9knpS4gfz, postId: 902sq546w5498hea764r80re0z89bej }
    Return: 400 Status (Bad Request) -- No comment provided, no Author to be the author of the comment, did not provide content type or type
            200 Status (OK) -- Successfully created comment
                                    { -id: 29c546d45f564a27871838825e3dbecb,
                                        author: author,
                                        comment: 'abc',
                                        contentType: text/plain,
                                        published: 2023-03-24T06:53:47.567Z,
                                        object: 902sq546w5498hea764r80re0z89bej
    */
    if(newComment == undefined){
        return [{}, 400];
    }
    
    let author = newComment.author;
    if((typeof author) == "string"){
        let authorObject = await Author.findOne({_id: author});
        if(authorObject == undefined){
            return [{}, 400];
        }

        author = {
            type: "author",
            id: process.env.DOMAIN_NAME + "authors/" + authorObject._id,
            host: process.env.DOMAIN_NAME,
            displayName: authorObject.username,
            url: process.env.DOMAIN_NAME + "authors/" + authorObject._id,
            github: authorObject.github,
            profileImage: authorObject.profileImage 
        }
    }
    if((typeof author) != "object"){
        return [{}, 400];
    }


    let senderId = author.id.split('/');
    senderId = senderId[senderId.length - 1];

    if(process.env.DOMAIN_NAME = author.host){
        if(! (await authLogin(token, senderId))) {return [{}, 401]}
    }

    const type = newComment.type;
    const comment = newComment.comment;
    const contentType = newComment.contentType;
    if(type != "comment" || !comment || !contentType ){
        return [{}, 400];
    }

    
    
    let published = newComment.published;
    if(!published){
        published = new Date().toISOString();
    }
    let id = newComment.id;
    if(!id){
        id = String(crypto.randomUUID()).replace(/-/g, "");
    }

    let comments = await CommentHistory.findOne({postId: postId}); 
    if (!comments) {
        // Must be a remote post
        let id = newComment.author._id ? newComment.author._id : newComment.author.id
        let obj = (id.split('/authors/'))[(id.split('/authors/')).length - 1]
        const outgoings = await OutgoingCredentials.find().clone();
        let auth = ''
        for (let i = 0; i < outgoings.length; i++) {
            if (outgoings[i].url === obj) {       
                auth = outgoings[i].auth;
            }
        }
        var config = {
            host: obj,
            url: id + '/inbox',
            method: 'POST',
            headers: {
                'Authorization': auth,
                'Content-Type': 'application/json'
            },
            data: {
                type: 'comment',
                author: newComment.author,
                likeCount: 0,
                comment: comment,
                contentType: contentType,
                published: published,
            }
        };

        await axios.request(config)
        .then( res => { })
        .catch( error => { })
    } else {
        author._id = author.id;
        comments.comments.push({
            _id: id,
            author: author,
            likeCount: 0,
            comment: comment,
            contentType: contentType,
            published: published,
        });
        await comments.save();
        
        let like = new LikeHistory({
            type: "comment",
            Id: id,
            likes: []
        });
    
        await like.save();
    
        inboxComment = {
            _id: id,
            author: author,
            comment: comment,
            contentType: contentType,
            published: published,
            object: postId,
        };
    
        const inbox = await Inbox.findOne({authorId: authorId});
        inbox.comments.push({
            _id: id,
            author: author,
            comment: comment,
            contentType: contentType,
            published: published,
            object: postId,
        });
        await inbox.save();
        delete author._id;
    
        return [inboxComment, 200];
    }
}

module.exports = {
    getComments,
    getComment,
    createComment
}
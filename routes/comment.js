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

async function deleteComment(req, res){
    let success = false;
    let numComments = 0;
    let publicPost = await PublicPost.find();
    await PostHistory.findOne({authorId: req.body.authorId}, async function(err, history){
        if (history) {
            let post_idx = history.posts.map(obj => obj._id).indexOf(req.body.postId);
            if (post_idx > -1) { 
                let com_idx = history.posts[post_idx].comments.map(obj => obj._id).indexOf(req.body.commentId);
                history.posts[post_idx].comments.splice(com_idx, 1);
                history.posts[post_idx].count - 1;
                numComments = history.posts[post_idx].count;
                success = true;
                await history.save();

                for (let i = 0; i < publicPost[0].posts.length; i++) {
                    if (publicPost[0].posts[i].post._id === req.body.postId) {
                        let com_idx = publicPost[0].posts[i].post.comments.map(obj => obj._id).indexOf(req.body.commentId);
                        publicPost[0].posts[i].post.comments.splice(com_idx, 1);
                        publicPost[0].posts[i].post.count - 1;
                        numComments = publicPost[0].posts[i].post.count;
                        await publicPost[0].save();
                    }
                }
            }
        }
    }).clone()
    
    return res.json({
        status: success,
        numComments: numComments
    })
}

async function editComment(req, res){
    let success = false;
    let publicPost = await PublicPost.find();
    await PostHistory.findOne({authorId: req.body.data.authorId}, async function(err, history){
        if (history) {
            let post_idx = history.posts.map(obj => obj._id).indexOf(req.body.data.postId);
            if (post_idx > -1) { 
                let com_idx = history.posts[post_idx].comments.map(obj => obj._id).indexOf(req.body.data.commentId);
                history.posts[post_idx].comments[com_idx].comment = req.body.data.comment;
                history.save();
                success = true;
            }

            for (let i = 0; i < publicPost[0].posts.length; i++) {
                if (publicPost[0].posts[i].post._id === req.body.data.postId) {
                    let com_idx = publicPost[0].posts[i].post.comments.map(obj => obj._id).indexOf(req.body.data.commentId);
                    publicPost[0].posts[i].post.comments[com_idx].comment = req.body.data.comment;
                    publicPost[0].posts[i].post.count - 1;
                    numComments = publicPost[0].posts[i].post.count;
                    await publicPost[0].save();
                }
            }
        }
    }).clone()
    
    return res.json({ status: success })
}

module.exports = {
    getComments,
    getComment,
    createComment
}
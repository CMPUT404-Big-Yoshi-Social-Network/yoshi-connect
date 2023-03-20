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
const { CommentHistory } = require('../scheme/interactions.js');
const { Author } = require('../scheme/author.js');
const {Follower } = require('../scheme/relations.js');

// UUID
const crypto = require('crypto');

// Additional Functions
const { authLogin, checkExpiry } = require('./auth.js');


async function getComments(authorId, postId, page, size) {
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
        return [[], 400];
    }

    return comments[0].comments_array;
}

async function getComment() {

}

async function createComment(token, authorId, postId, newComment, domain) {
    if(!(await authLogin(token, newComment.author.id))){ return [{}, 401]; }

    //verify comment is valid
    //find comment history for post
    //push to comment history

    //if author is object verify it is real

    //if author is string also verify it is real.
    //After pull relavent details

    const type = newComment.type;
    const author = newComment.author
    const comment = newComment.comment
    const contentType = newComment.contentType;
    let published = newComment.published;
    let id = newComment.id;

    if(!id){
        //generate new id
        id = String(crypto.randomUUID()).replace(/-/g, "");
    }

    if(!published){
        //generate new date
        published = new Date().toISOString();
    }

    let comments = await CommentHistory.findOne({postId: postId}); 
    
    comments.comments.push({
        _id: id,
        author: author,
        comment: comment,
        contentType: contentType,
        published: published
    })

    await comments.save();

    //PUsh to comment history
    //Add to inbox
    const inbox = Inbox.findOne({authorId: authorId});
    //TODO FIRST THING TO DO WHEN I GET BACK TO THIS
    /*
    inbox.comments.push({
        author: author,
        comment: comment,
        contentType: contentType,
        published: published,
        postId: postId,
        commentId: id
    })
    */
    return [newComment, 200]
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
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
const { PostHistory, PublicPost, Post } = require('../scheme/post.js');
const { Like, Liked } = require('../scheme/interactions.js');
const { Author } = require('../scheme/author.js');

// UUID
const crypto = require('crypto');

// Additional Functions
const { authLogin } = require('./auth.js');


async function addLike(req, res){
    const postHistory = await PostHistory.findOne({authorId: req.body.data.authorId});
    let publicPost = await PublicPost.find();
    let success = false;
    let numLikes = 0;
    let uuid = String(crypto.randomUUID()).replace(/-/g, "");

    var like = new Like({ 
        _id: uuid,
        liker: req.body.data.liker 
    });

    let idx = postHistory.posts.map(obj => obj._id).indexOf(req.body.data.postId);
    if (idx > -1) { 
        let likerIdx = postHistory.posts[idx].likes.map(obj => obj.liker).indexOf(like.liker);
        if (likerIdx <= -1) {
            postHistory.posts[idx].likes.push(like);
            numLikes = postHistory.posts[idx].likes.length;
            await postHistory.save();
            success = true;

            for (let i = 0; i < publicPost[0].posts.length; i++) {
                if (publicPost[0].posts[i].post._id === req.body.data.postId) {
                    publicPost[0].posts[i].post.likes.push(like);
                    numLikes = publicPost[0].posts[i].post.likes.length;
                    await publicPost[0].save();
                }
            }
        }
    } 

    return res.json({ status: success, numLikes: numLikes })
}

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

async function hasLiked(req, res) {
    const likers = await fetchLikes(req, res);
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
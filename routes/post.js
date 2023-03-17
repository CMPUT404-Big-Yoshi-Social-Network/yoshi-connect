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
const { Like, Comment, Liked } = require('../scheme/interactions.js');
const { Author } = require('../scheme/author.js');

//UUID
const crypto = require('crypto');

// Additional Functions
const { authLogin } = require('./auth.js');

async function createPostHistory(author_id){
    let uuid = String(crypto.randomUUID).replace(/-/g, "");
    let new_post_history = new PostHistory ({
        _id: uuid,
        authorId: author_id,
        num_posts: 0,
        posts: []
    })

    await new_post_history.save()
}

async function getPost(authorId, postId){
    let post = await PostHistory.aggregate([
        {
            $match: {'authorId': authorId}
        },
        {
            $unwind: "$posts"
        },
        {
            $match: {'posts._id' : postId}
        }
    ]);
    
    if (post.length == 0) { return [{}, 404]; }

    post = post[0].posts

    post = {
        "type": "post",
        "title" : post.title,
        "id": process.env.DOMAIN_NAME + "authors/" + authorId + "/" + postId,
        "source": post.source,
        "origin": post.origin,
        "description": post.description,
        "contentType": post.contentType,
        "author": post.author, 
        "categories": post.categories,
        "count": post.count,
        "comments": post.comments,
        "commentSrc": post.commentSrc,
        "published": post.published,
        "visibility": post.visibility,
        "unlisted": post.unlisted
    }
    return [post, 200]   
}

async function createPost(token, authorId, postId, newPost) {
    if((await authLogin(token, authorId)) == false){ return [[], 401]; }

    const title = newPost.title;
    const desc = newPost.desc;
    const contentType = newPost.contentType;
    const content = newPost.content;
    const categories = [''];
    const published = new Date().toISOString();
    const visibility = newPost.visibility;
    const unlisted = newPost.unlisted;
    const postTo = newPost.postTo;

    if (!title || !desc || !contentType || !content || !visibility) { return [[], 400]; }

    let postHistory = await PostHistory.findOne({authorId: authorId});

    if(postId != undefined){
        let oldPost = postHistory.posts.id(postId);
        if(oldPost) return [[], 400]
    }
    
    if (!postId) { postId = String(crypto.randomUUID).replace(/-/g, ""); }

    let source = process.env.DOMAIN_NAME + "/authors/" + authorId + "/posts/" + postId;
    let origin = process.env.DOMAIN_NAME + "/authors/" + authorId + "/posts/" + postId;

    if (!postHistory) {
        await createPostHistory(authorId);
        postHistory = await PostHistory.findOne({authorId: authorId});
    }

    let post = new Post({
        _id: postId,
        title: title,
        source: source,
        origin: origin,
        description: desc,
        contentType: contentType,
        content: content,
        authorId: authorId,
        categories: categories,
        count: 0,
        likes: [],
        comments: [],
        published: published,
        visibility: visibility,
        unlisted: unlisted,
        postTo: postTo
    });
    postHistory.posts.push(post);
    postHistory.num_posts = postHistory.num_posts + 1;
    await postHistory.save();

    if (visibility == 'Public') {
        const publicPost = await PublicPost.findOne().clone();
        publicPost.posts.push({
            authorId: authorId,
            post: post,
        })
        publicPost.num_posts = publicPost.num_posts + 1;
        await publicPost.save();
    }
    return [await getPost(authorId, postId), 200];
}

async function updatePost(token, authorId, postId, newPost) {
    if (!authLogin(token, authorId)) { return [{}, 401]; }

    const title = newPost.title;
    const desc = newPost.description;
    const contentType = newPost.contentType;
    const content = newPost.content;
    const categories = newPost.categories;
    const visibility = newPost.visibility;
    const unlisted = newPost.unlisted;

    const postHistory = await PostHistory.findOne({authorId: authorId});

    if (!postHistory) { return [{}, 500]; }

    let post = postHistory.posts.id(postId);

    if (!post) { return [{}, 404]; }

    post.title = title;
    post.description = desc;
    post.contentType = contentType;
    post.content = content;
    post.visibility = visibility;
    post.unlisted = unlisted;
    post.categories = categories;
    await postHistory.save()

    //TODO Remove possiblity of visibility being "public"?
    if(post.visibility == "PUBLIC" || post.visibility == "Public"){
        let publicPosts = await PublicPost.findOne().clone();

        for(let i = 0; i < publicPosts.posts.length; i++){
            let publicPost = publicPosts.posts[i];
            if(publicPost.post._id == post._id){
                publicPosts.posts[i].post = post;
                await publicPosts.save();
                break;
            }
        }
    }

    return [await getPost(authorId, postId), 200];
}

async function deletePost(token, authorId, postId) {
    if (!authLogin(token, authorId)) { return [{}, 401]; }

    const postHistory = await PostHistory.findOne({authorId: authorId});

    if (!postHistory) { return [[], 500]; }

    const post = postHistory.posts.id(postId);

    if(!post) { return [[], 404]; }

    post.remove();
    postHistory.num_posts = postHistory.num_posts - 1;
    postHistory.save();

    if (post.visibility == "PUBLIC" || post.visibility == "Public") {
        const publicPost = await PublicPost.findOne().clone();
        let posts = publicPost.posts;
        for (let i = 0; i < posts.length; i++) {
            if (posts[i].post._id === post._id) {
                publicPost.posts[i].remove();
                break;
            }
        }
        publicPost.num_posts = publicPost.num_posts - 1;
        await publicPost.save();
    }

    return [post, 200]; 
}

async function getPosts(page, size, author) {
    let posts = undefined
    if(page > 1){
        posts = await PostHistory.aggregate([
            {
                $match: {'authorId': author.id}
            },
            {
                $unwind: '$posts'
            },
            {
                $match: {
                    'posts.unlisted': false
                }
            },
            {
                $match: {
                    'posts.visibility': {$in : ["PUBLIC"]}
                }
            },
            {
                $set: {
                    "posts.published": {
                        $dateFromString: { dateString: "$posts.published" }
                    }
                }
            },
            {
                $sort: { "posts.published": -1 }
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
                    posts_array: { $push: "$posts" }
                }
            },
        ]);
    } else if (page == 1) {
        posts = await PostHistory.aggregate([
            {
                $match: {'authorId': author.id}
            },
            {
                $unwind: '$posts'
            },
            {
                $match: {
                    'posts.unlisted': false,
                    
                }
            },
            {
                $match: {
                    'posts.visibility': {$in : ["PUBLIC"]}
                }
            },
            {
                $set: {
                    "posts.published": {
                        $dateFromString: { dateString: "$posts.published" }
                    }
                }
            },
            {
                $sort: { "posts.published": -1 }
            },
            {
                $limit: size
            },
            {
                $group: {
                    _id: null,
                    posts_array: { $push: "$posts" }
                }
            }
            
        ]);
    } else{
        return [[], 400];
    }
    
    if (!posts || !posts[0] || !posts[0].posts_array) { return [[], 200]; }
    
    posts = posts[0].posts_array;

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        let sanitized_posts = {
            "type": "post",
            "tite'": post.title,
            "id": post._id,
            "source": post.source,
            "origin": post.origin,
            "description": post.description,
            "contentType": post.contentType,
            "content": post.content,
            "author": author,
            "categories": post.categories,
            "count": post.comments.length,
            "comments": "",
            "likeCount": post.likes.length,
            "likes": "",
            "published": post.published,
            "visibility": post.visibility,
            "unlisted": post.unlisted,
        }
        posts[i] = sanitized_posts;
    }
    return [posts, 200];
}

async function addLike(req, res){
    const postHistory = await PostHistory.findOne({authorId: req.body.data.authorId});
    let publicPost = await PublicPost.find();
    let success = false;
    let numLikes = 0;
    let uuid = String(crypto.randomUUID).replace(/-/g, "");

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

async function hasLiked(req, res) {
    const likers = await fetchLikes(req, res);
    for (let i = 0; i < likers.length; i++) {
        if (likers[i].liker === req.body.data.viewerId) {
            return res.json({ status: 'liked' })
        }
    }
    return res.json({ status: 'unliked' })
}

async function getComments(authorId, postId) {
    // TODO: Paginate
    const posts = PostHistory.find(
        {
            $match: {'authorId': authorId}
        },
        {
            $unwind: '$posts'
        },
        {
            $match: {'_id': postId}
        },
        {
            index: { $indexOfArray: ['_id', postId] }
        },
        {
            $unwind: '$index'
        },
        {
            $set: {
                "index.comments.published": {
                    $dateFromString: { dateString: "$index.comments.published" }
                }
            }
        },
        {
            $sort: { "index.comments.published": -1 }
        },
        {
            $group: {
                _id: null,
                post_array: { $push: "$index" }
            }
        }
    )

    if (posts[0] != undefined) {
        return posts[0].post_array.comments;
    } else {
        return [];
    }   
}

async function createComment(authorId, postId, newComment, domain) {
    const postHistory = await PostHistory.findOne({authorId: authorId});
    const author = await Author.findOne({authorId: authorId});
    let uuid = String(crypto.randomUUID).replace(/-/g, "");

    var comment = new Comment({
        author: author,
        comment: newComment.content,
        contentType: newComment.contentType,
        published: new Date().toISOString(),
        _id: domain + "authors/" + authorId + "/posts/" + postId + "/comments/" + uuid
    });

    let idx = postHistory.posts.map(obj => obj._id).indexOf(req.body.postId);

    if (idx > -1) { 
        postHistory.posts[idx].comments.push(comment);
        postHistory.posts[idx].count + 1;
        postHistory.save();
    }

    return comment  
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

async function getAuthorLikes(authorId) { return await Liked.findOne({authorId: authorId}); }

async function fetchMyPosts(req, res) {
    const posts = await PostHistory.aggregate([
        {
            $match: {
                $expr: {
                    $in : ["$authorId", [req.params.authorId]]
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
            $addFields: {
                "posts.authorId": "$authorId"
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
        items: posts[0].posts_array
    })
}

async function fetchOtherPosts(req, res) {
    const posts = await PostHistory.aggregate([
        {
            $match: {
                $expr: {
                    $in : ["$authorId", [req.params.other]]
                }
            },
        },
        {
            $unwind: "$posts"
        },
        {
            $match: {
                $expr: {
                    $ne: ["$unlisted", true]
                }
            }
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
            $addFields: {
                "posts.authorId": "$authorId"
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
        items: posts[0].posts_array
    })
}

module.exports={
    addLike,
    deleteLike,
    deleteComment,
    editComment,
    hasLiked,
    getPost,
    updatePost,
    deletePost,
    createPost,
    getPosts,
    getComments,
    createComment,
    fetchLikes,
    fetchCommentLikes,
    getAuthorLikes,
    fetchMyPosts,
    fetchOtherPosts
}
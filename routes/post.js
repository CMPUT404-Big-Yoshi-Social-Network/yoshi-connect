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
const { Friend } = require('../scheme/relations.js');

//UUID
const crypto = require('crypto');
const { authLogin } = require('./auth.js');

async function createPostHistory(author_id){
    /**
     * Description: Creates and saves the author's post history 
     * Returns: N/A
     */
    console.log('Debug: Creating post history for user')
    let new_post_history = new PostHistory ({
        authorId: author_id,
        num_posts: 0,
        posts: []
    })

    await new_post_history.save()

    return;
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
    
    if(post.length == 0) {
        return [{}, 404];
    }

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
    
    if (!postId) { postId = crypto.randomUUID(); }

    let source = process.env.DOMAIN_NAME + "/authors/" + authorId + "/posts/" + postId;
    let origin = process.env.DOMAIN_NAME + "/authors/" + authorId + "/posts/" + postId;

    if (!postHistory) {
        console.log('Debug: Create a post history');
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
    console.log(postHistory)
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
    if(!authLogin(token, authorId)){
        return [{}, 401];
    }

    const title = newPost.title;
    const desc = newPost.description;
    const contentType = newPost.contentType;
    const content = newPost.content;
    const categories = newPost.categories;
    const visibility = newPost.visibility;
    const unlisted = newPost.unlisted;

    const postHistory = await PostHistory.findOne({authorId: authorId});

    if(!postHistory){
        return [{}, 500];
    }

    const post = postHistory.posts.id(postId);

    if(!post){
        return [{}, 404];
    }

    if(title){
        post.title = title;
    }
    if(desc){
        post.description = desc;
    }
    if(contentType){
        post.contentType = contentType;
    }
    if(content){
        post.content = content;
    }
    if(visibility){
        post.visibility = visibility;
    }
    if(unlisted){
        post.unlisted = unlisted;
    }
    if(categories){
        post.categories = categories;
    }
    await postHistory.save()

    return [await getPost(authorId, postId), 200];
}

async function deletePost(token, authorId, postId) {
    if(!authLogin(token, authorId)){
        return [{}, 401];
    }

    const postHistory = await PostHistory.findOne({authorId: authorId});

    if (!postHistory) return [[], 500];

    const post = postHistory.posts.id(postId);

    if(!post) return [[], 404];

    post.remove();
    postHistory.num_posts = postHistory.num_posts - 1;
    postHistory.save();

    return [post, 200]; 
}

async function getPosts(page, size, author) {
    let posts = undefined
    //TODO WHEN FRIENDS IS DONE FILTER POSTS FOR FRIENDS AND FOR PUBLIC 
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
    }
    else if (page == 1) {
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
    }
    else{
        return [[], 400];
    }
    if(!posts || !posts[0] || !posts[0].posts_array){
        return [[], 200];
    }
    
    posts = posts[0].posts_array;

    for(let i = 0; i < posts.length; i++){
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
    /**
     * Description: Adds a like to the author's post to the database 
     * Returns: A boolean status if the like is successfully saved into the database
     *          The number of likes the post has
     */
    console.log('Debug: Adding a like')
    const postHistory = await PostHistory.findOne({authorId: req.body.data.authorId});
    let publicPost = await PublicPost.find();
    let success = false;
    let numLikes = 0;

    var like = new Like({
        liker: req.body.data.liker
    });

    let idx = postHistory.posts.map(obj => obj._id).indexOf(req.body.data.postId);
    if (idx > -1) { 
        let likerIdx = postHistory.posts[idx].likes.map(obj => obj.liker).indexOf(like.liker);
        if (likerIdx <= -1) {
            console.log('Debug: Adding that like!')
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
    } else {
        console.log('Debug: No such post exists!')
    }

    return res.json({ status: success, numLikes: numLikes })
}

async function deleteLike(req, res){
    /**
     * Description: Removes a like from the author's post in the database 
     * Returns: A boolean status if the like is successfully removed from the database
     *          The number of likes the post has
     */
    console.log('Debug: Removing a like')
    let success = false;
    let numLikes = 0;
    let publicPost = await PublicPost.find();
    await PostHistory.findOne({authorId: req.body.authorId}, async function(err, history){
        console.log('Debug: Find the post with the like.')
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

async function addComment(req, res){
    /**
     * Description: Adds a comment to an author's post to the database 
     * Returns: A boolean status if the comment is successfully saved into the database
     *          The number of comments the post has
     */
    console.log('Debug: Adding a comment')
    const postHistory = await PostHistory.findOne({authorId: req.body.authorId});
    let publicPost = await PublicPost.find();
    let success = false;

    var comment = new Comment({
        commenter: req.body.commenter,
        comment: req.body.content
    });

    let idx = postHistory.posts.map(obj => obj._id).indexOf(req.body.postId);
    if (idx > -1) { 
        postHistory.posts[idx].comments.push(comment);
        postHistory.posts[idx].count + 1;
        postHistory.save();
        success = true;

        for (let i = 0; i < publicPost[0].posts.length; i++) {
            if (publicPost[0].posts[i].post._id === req.body.postId) {
                publicPost[0].posts[i].post.count + 1;
                publicPost[0].posts[i].post.comments.push(comment);
                await publicPost[0].save();
            }
        }
    } else {
        console.log('Debug: No such post exists!')
    }

    return res.json({ status: success, numComments: postHistory.posts[idx].count })
}

async function deleteComment(req, res){
    /**
     * Description: Removes a comment from an author's post in the database 
     * Returns: A boolean status if the comment is successfully removed from the database
     *          The number of comments the post has
     */
    console.log('Debug: Deleting a comment')
    let success = false;
    let numComments = 0;
    let publicPost = await PublicPost.find();
    await PostHistory.findOne({authorId: req.body.authorId}, async function(err, history){
        console.log('Debug: Find the post with the comment.')
        if (history) {
            let post_idx = history.posts.map(obj => obj._id).indexOf(req.body.postId);
            if (post_idx > -1) { 
                console.log('Debug: Found comment')
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
    /**
     * Description: Edits a comment from an author's post in the database 
     * Returns: A boolean status if the comment is successfully edited to the database
     */
    console.log('Debug: Editing a comment')
    let success = false;
    let publicPost = await PublicPost.find();
    await PostHistory.findOne({authorId: req.body.data.authorId}, async function(err, history){
        console.log('Debug: Find the post with the comment.')
        if (history) {
            let post_idx = history.posts.map(obj => obj._id).indexOf(req.body.data.postId);
            if (post_idx > -1) { 
                console.log('Debug: Found the comment')
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

async function checkVisibility(req, res){
    /**
     * Description: Checks the visibility level of the author's post for the viewer
     * Returns: Status 404 if the author's post is not found in the database
     *          Status 404 if the author's post visibility level is not viewable for the viewer
     *          The author's post if the visibility level is viewable for the viewer
     */
    console.log('Debug: Checks the visibility of the post for the viewer');
    const authorId = req.params.author_id;
    const viewerId = req.body.data.viewerId;
    const postId = req.params.post_id;

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
    if(post.length == 0) { return res.sendStatus(404); }

    let viewable = false;
    if ( post.visibility == 'Public') {
        console.log('Debug: Everyone can see this post.')
        viewable = true;
    } else if ( post.visibility == 'Friends' ) {
        console.log('Debug: Only friends can see this post.')
        let friends = [];
        await Friend.findOne({authorId: authorId}, function(err, friend){
            console.log('Debug: Finding the friends list of post author.')
            if (friend) {
                friends = friend.friends;
            }
        }).clone()

        for ( let i = 0; i < friends.length ; i++ ) {
            if ( viewerId == friends[i].authorId ) {
                viewable = true;
                break;
            }
        }

        if ( !viewable ) {
            return res.sendStatus(404);
        } 
    } else if ( post.visibility == 'Private' ) {
        console.log('Debug: Only specific people can see this post (i.e., messages).')
        for ( let i = 0; i < post.specifics.length ; i++ ) {
            if ( viewerId == post.specifics[i].authorId ) {
                viewable = true;
                break;
            }
        }
        if ( !viewable ) {
            return res.sendStatus(404);
        }
    }

    return res.json({
        viewable: viewable
    })

}

async function fetchLikers(req, res) {
    /**
     * Description: Finds the authors that liked an author's post from the database 
     * Returns: Status 404 if the author's post is not found in the database
     *          The authors who liked the post
     */
    console.log('Debug: Getting the likers for a specific post.');

    const authorId = req.body.data.authorId;
    const postId = req.body.data.postId;

    const post = await PostHistory.aggregate([
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
    if(post.length == 0) { return res.sendStatus(404); }
    
    return post[0].posts.likes
}

async function hasLiked(req, res) {
    /**
     * Description: Shows the like status of the authors who liked a post from the database 
     * Returns: The status 'liked' if the author has liked the post
     *          The status 'unliked' if the author has unliked the post
     */
    const likers = await fetchLikers(req, res);
    for (let i = 0; i < likers.length; i++) {
        if (likers[i].liker === req.body.data.viewerId) {
            return res.json({
                status: 'liked'
            })
        }
    }
    return res.json({
        status: 'unliked'
    })
}

/**
 * API STUFF
 */

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
    console.log('Debug: Adding a comment')
    const postHistory = await PostHistory.findOne({authorId: authorId});
    const author = await Author.findOne({authorId: authorId});

    var comment = new Comment({
        author: author,
        comment: newComment.content,
        contentType: newComment.contentType,
        published: new Date().toISOString(),
        _id: domain + "authors/" + authorId + "/posts/" + postId + "/comments/" + uidgen.generateSync()
    });

    let idx = postHistory.posts.map(obj => obj._id).indexOf(req.body.postId);
    if (idx > -1) { 
        postHistory.posts[idx].comments.push(comment);
        postHistory.posts[idx].count + 1;
        postHistory.save();
    }
    else {
        console.log('Debug: No such post exists!')
    }

    return comment  
}

async function apifetchLikes(authorId, postId) {
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

async function apiFetchCommentLikes(authorId, postId, commentId) {
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

async function getAuthorLikes(authorId) {
    return await Liked.findOne({authorId: authorId});
}

module.exports={
    createPostHistory,
    addLike,
    addComment,
    deleteLike,
    deleteComment,
    editComment,
    checkVisibility,
    hasLiked,
    getPost,
    updatePost,
    deletePost,
    createPost,
    getPosts,
    getComments,
    createComment,
    apifetchLikes,
    apiFetchCommentLikes,
    getAuthorLikes
}
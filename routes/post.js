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
const { LikeHistory, CommentHistory, LikedHistory} = require('../scheme/interactions.js');
const { Author } = require('../scheme/author.js');
const {Follower} = require('../scheme/relations.js');

// UUID
const crypto = require('crypto');

// Additional Functions
const { authLogin } = require('./auth.js');

async function createPostHistory(author_id){
    let uuid = String(crypto.randomUUID()).replace(/-/g, "");
    let new_post_history = new PostHistory ({
        _id: uuid,
        authorId: author_id,
        num_posts: 0,
        posts: []
    })

    await new_post_history.save()
}

async function getPost(postId, author){
    let post = await PostHistory.aggregate([
        {
            $match: {'authorId': author.authorId}
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
        "id": process.env.DOMAIN_NAME + "authors/" + author.authorId + "/" + postId,
        "source": post.source,
        "origin": post.origin,
        "description": post.description,
        "contentType": post.contentType,
        "author": author, 
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
    if(! (await authLogin(token, authorId))){ return [[], 401]; }

    const title = newPost.title;
    const description = newPost.description;
    const contentType = newPost.contentType;
    const content = newPost.content;
    const categories = [''];
    const published = new Date().toISOString();
    const visibility = newPost.visibility;
    const unlisted = newPost.unlisted;
    const postTo = newPost.postTo;

    let postHistory = await PostHistory.findOne({authorId: authorId});

    if(postId != undefined){
        let oldPost = postHistory.posts.id(postId);
        if (oldPost) return [[], 400]
    }
    
    if (!postId) { postId = String(crypto.randomUUID()).replace(/-/g, ""); }

    let source = process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId;
    let origin = process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId;

    if (!postHistory) {
        await createPostHistory(authorId);
        postHistory = await PostHistory.findOne({authorId: authorId});
    }

    let post = {
        _id: postId,
        title: title,
        source: source,
        origin: origin,
        description: description,
        contentType: contentType,
        content: content,
        authorId: authorId,
        categories: categories,
        count: 0,
        like_count: 0,
        comment_count: 0,
        published: published,
        visibility: visibility,
        unlisted: unlisted,
        postTo: postTo
    };

    postHistory.posts.push(post);
    postHistory.num_posts = postHistory.num_posts + 1;

    const savePostPromise = await postHistory.save();

    let likes = LikeHistory({
        type: "post",
        Id: postId,
        likes: [],
    }).save();

    let comments = CommentHistory({
        postId: postId,
        comments: [],
    }).save();

    await likes;
    await comments;
    savePostPromise;

    if (visibility == 'PUBLIC') {
        const publicPost = await PublicPost.findOne().clone();
        publicPost.posts.push({
            authorId: authorId,
            post: post,
        })
        publicPost.num_posts = publicPost.num_posts + 1;
        await publicPost.save();
    }

    //TODO make this faster
    //if not unlisted send to all followers 
    if(unlisted === "false"){
        const followers = await Follower.findOne({authorId: authorId}).clone();
        for(let i = 0; i < followers.followers.length; i++){
            const follower = followers.followers[i].authorId;
            console.log(follower);
            const inbox = await Inbox.findOne({authorId: follower}, "_id authorId posts").clone();

            console.log(inbox);

            inbox.posts.push(post);
            await inbox.save();
        }
    }
    return [await getPost(authorId, postId), 200];
}

async function updatePost(token, authorId, postId, newPost) {
    if (!(await authLogin(token, authorId))) { return [{}, 401]; }

    const title = newPost.title;
    const desc = newPost.desc;
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

    if(unlisted === "false"){
        const followers = await Follower.findOne({authorId: authorId}).clone();
        let promiseList = [];
        for(let i = 0; i < followers.followers.length; i++){
            const follower = followers.followers[i].authorId;
            console.log(follower);
            const inbox = await Inbox.findOne({authorId: follower}, "_id authorId posts").clone();

            console.log(inbox);

            inbox.posts.push(post);
            promiseList.push(inbox.save());
        }

        for(let i = 0; i < promiseList.length; i++){
            await promiseList[i];
        }
    }

    return [await getPost(authorId, postId), 200];
}

async function deletePost(token, authorId, postId) {
    if (!( await authLogin(token, authorId))) { return [{}, 401]; }

    const postHistory = await PostHistory.findOne({authorId: authorId});

    if (!postHistory) { return [[], 500]; }

    const post = postHistory.posts.id(postId);

    if(!post) { return [[], 404]; }

    post.remove();
    postHistory.num_posts = postHistory.num_posts - 1;

    const likes = LikeHistory.findOneAndDelete({Id: postId, type: "Post"});
    const comments = CommentHistory.findOneAndDelete({postId: postId});
    
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

    await likes;
    await comments;

    return [post, 200]; 
}

async function getPosts(page, size, author) {
    let posts = undefined
    //TODO Avoid duplicated code by using a list of objects and modifying them before sending
    if(page > 1){
        posts = await PostHistory.aggregate([
            {
                $match: {'authorId': author.authorId}
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
                $match: {'authorId': author.authorId}
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
            "id": process.env.DOMAIN_NAME + "authors/" + author.authorId + '/posts/' + post._id,
            "source": post.source,
            "origin": post.origin,
            "description": post.description,
            "contentType": post.contentType,
            "content": post.content,
            "author": author,
            "categories": post.categories,
            "count": post.count,
            "comments": process.env.DOMAIN_NAME + "authors/" + author.authorId + '/posts/' + post._id + '/comments/',
            "likeCount": post.likes_count,
            "likes": "",
            "published": post.published,
            "visibility": post.visibility,
            "unlisted": post.unlisted,
        }
        posts[i] = sanitized_posts;
    }
    return [posts, 200];
}

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

    if (posts[0] == undefined) {
        return res.json({
            type: "posts",
            items: []
        })        
    }

    return res.json({
        type: "posts",
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
        }
    ]);

    if (posts[0] == undefined) {
        return res.json({
            type: "posts",
            items: [] 
        })
    } else {
        return res.json({
            type: "posts",
            items: posts[0].posts_array
        })
    }
}

module.exports={
    getPost,
    updatePost,
    deletePost,
    createPost,
    getPosts,
    fetchMyPosts,
    fetchOtherPosts
}
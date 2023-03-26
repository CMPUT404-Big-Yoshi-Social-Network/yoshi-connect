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
const { PostHistory, PublicPost, Post, Image, Inbox } = require('../scheme/post.js');
const { LikeHistory, CommentHistory, LikedHistory} = require('../scheme/interactions.js');
const { Author, Login } = require('../scheme/author.js');
const { Follower, Following } = require('../scheme/relations.js');


// UUID
const crypto = require('crypto');

// Additional Functions
const { authLogin } = require('./auth.js');
const { getAuthor } = require('./author.js');

async function createPostHistory(author_id){
    let uuid = String(crypto.randomUUID()).replace(/-/g, "");
    let new_post_history = new PostHistory ({
        _id: uuid,
        authorId: author_id,
        num_posts: 0,
        posts: []
    });

    await new_post_history.save();
}

async function uploadImage(url, image) {
    let newImage = new Image ({
        _id: url,  
        src: image
    })
    await newImage.save()
    return [newImage, 200]
}

async function editImage(url, src) {
    let image = await Image.findOne({_id: url});
    if (!image) { return [{}, 404]; }
    image.src = src;
    await image.save()
    return [image, 200]
}

async function getImage(url) {
    let image = await Image.findOne({_id: url});
    if (!image) { return [{}, 404]; }
    return [image.src, 200];
}

async function getPost(postId, auth, author){
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
    
    if (post.length == 0 || !post[0].posts) { return [{}, 404]; }

    post = post[0].posts

    if(post.visibility == "FRIENDS"){
        let follower = false;
        if(!auth){
            return [{}, 401];
        }
        else if(auth == "server"){
            follower = true;
        }
        else{
            let login = await Login.findOne({token: auth});

            if(!login){
                return [{}, 401];
            }

            //TODO ONLY WORKS FOR CURRENT SERVER NOT MULTIPLE
            let authorId = author.id.split("/");
            authorId = authorId[authorId.length - 1];
            let following = await Following.findOne({authorId: authorId});

            if(!following || !following.followings){
                return [{}, 401];
            }

            for(let i = 0; i < following.followings.length; i++){
                follow = following.followings[i];
                if(follow.authorId = login.authorId){
                    follower = true;
                    break;
                }
            }
        }
        
        if(!follower) return [{}, 401];
    }

    post = {
        "type": "post",
        "title" : post.title,
        "id": process.env.DOMAIN_NAME + "authors/" + author.authorId + "/posts/" + postId,
        "source": post.source,
        "origin": post.origin,
        "description": post.description,
        "contentType": post.contentType,
        "content": post.content,
        "author": author,
        "categories": post.categories,
        "count": post.commentCount,
        "likeCount": post.likeCount,
        "comments": process.env.DOMAIN_NAME + "authors/" + author.authorId + '/posts/' + post._id + '/comments/',
        "commentSrc": post.commentSrc,
        "published": post.published,
        "visibility": post.visibility,
        "unlisted": post.unlisted
    }
    return [post, 200]   
}

async function createPost(token, authorId, postId, newPost) {
    if(! (await authLogin(token, authorId))){ return [[], 401]; }

    let authorPromise = getAuthor(authorId);

    const title = newPost.title;
    const description = newPost.description;
    const contentType = newPost.contentType;
    const content = newPost.content;
    const categories = [''];
    const published = new Date().toISOString();
    const visibility = newPost.visibility;
    const unlisted = newPost.unlisted;
    const postTo = newPost.postTo;

    if(!title || !description || !contentType || !content || !categories || (visibility != "PUBLIC" && visibility != "FRIENDS") || (unlisted != 'true' && unlisted != 'false')){
        return [[], 400];
    }

    let postHistory = await PostHistory.findOne({authorId: authorId});
    if (!postHistory) {
        return [[], 404];
    }

    if(postId != undefined){
        let oldPost = postHistory.posts.id(postId);
        if (oldPost) return [[], 400];
    }
    
    if (!postId) { postId = String(crypto.randomUUID()).replace(/-/g, ""); }

    let source = process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId;
    let origin = process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId;

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
        likeCount: 0,
        commentCount: 0,
        published: published,
        visibility: visibility,
        unlisted: unlisted,
        postTo: postTo
    };

    postHistory.posts.push(post);
    postHistory.num_posts = postHistory.num_posts + 1;

    let savePostPromise = postHistory.save();

    let likes = LikeHistory({
        type: "post",
        Id: postId,
        likes: [],
    }).save();

    let comments = CommentHistory({
        postId: postId,
        comments: [],
    }).save();

    let [author, status] = await authorPromise;
    if (status != 200) return [{}, 500];

    if (visibility == 'PUBLIC') {
        post.author = {
            _id: author.id,
            displayName: author.displayName,
            profileImage: author.profileImage,
            pronouns: author.pronouns
        }
        const publicPost = new PublicPost(post);
        await publicPost.save();
    }

    //TODO make this faster
    //if not unlisted send to all followers 
    if(unlisted === "false"){
        const followers = await Follower.findOne({authorId: authorId}).clone();
        for(let i = 0; i < followers.followers.length; i++){
            const follower = followers.followers[i].authorId;
            const inbox = await Inbox.findOne({authorId: follower}, "_id authorId posts").clone();

            inbox.posts.push(post);
            await inbox.save();
        }
    }

    await likes;
    await comments;
    await savePostPromise;
    return await getPost(postId, authorId, author);
}

async function updatePost(token, authorId, postId, newPost) {
    if (!(await authLogin(token, authorId))) { return [{}, 401]; }
    const title = newPost.title;
    const description = newPost.description;
    const contentType = newPost.contentType;
    const content = newPost.content;
    const categories = newPost.categories;
    const visibility = newPost.visibility;
    const unlisted = newPost.unlisted;

    if(!title || !description || !contentType || !content || !categories || (visibility != "PUBLIC" && visibility != "FRIENDS") || (unlisted != 'true' && unlisted != 'false')){
        return [{}, 400];
    }

    const postHistory = await PostHistory.findOne({authorId: authorId});

    if (!postHistory) { return [{}, 500]; }

    let post = postHistory.posts.id(postId);
    if(unlisted == 'false' && visibility == "PUBLIC" && !post.unlisted && post.visibility == "PUBLIC") {
        let publicPosts = await PublicPost.findOne({_id: postId}).clone();
        if(!publicPosts) return [{}, 500];
        publicPosts.title = title;
        publicPosts.description = description;
        publicPosts.contentType = contentType;
        publicPosts.content = content;
        publicPosts.visibility = visibility;
        publicPosts.unlisted = unlisted;
        publicPosts.categories = categories;
        await publicPosts.save();
    }
    else if(unlisted == 'false' && visibility == "PUBLIC") {
        let publicPost = {
            _id: postId,
            title: title,
            source: post.source,
            origin: post.origin,
            description: description,
            contentType: contentType,
            content: content,
            authorId: authorId,
            categories: categories,
            likeCount: post.likeCount,
            commentCount: post.commentCount,
            published: post.published,
            visibility: visibility,
            unlisted: unlisted,
            postTo: post.postTo
        };
        await (new PublicPost(publicPost)).save();
    }
    else if(unlisted == "true" || visibility == "FRIENDS"){
        await PublicPost.findOneAndDelete({_id: postId}).clone();
    }

    post.title = title;
    post.description = description;
    post.contentType = contentType;
    post.content = content;
    post.visibility = visibility;
    post.unlisted = unlisted;
    post.categories = categories;
    await postHistory.save()
    
    /*
    if(unlisted === "false"){
        const followers = await Follower.findOne({authorId: authorId}).clone();
        let promiseList = [];
        for(let i = 0; i < followers.followers.length; i++){
            const follower = followers.followers[i].authorId;
            const inbox = await Inbox.findOne({authorId: follower}, "_id authorId posts").clone();
            inbox.posts.push(post);
            promiseList.push(inbox.save());
        }

        for(let i = 0; i < promiseList.length; i++){
            await promiseList[i];
        }
    }
    */
    let author = await getAuthor(authorId);
    return await getPost(postId, token, author[0]);
}

async function deletePost(token, authorId, postId) {
    if (!( await authLogin(token, authorId))) { return [{}, 401]; }

    const postHistory = await PostHistory.findOne({authorId: authorId});

    if (!postHistory) { return [{}, 404]; }

    const post = postHistory.posts.id(postId);

    if(!post) { return [{}, 404]; }

    post.remove();
    postHistory.num_posts = postHistory.num_posts - 1;

    const likes = LikeHistory.findOneAndDelete({Id: postId, type: "Post"});
    const comments = CommentHistory.findOneAndDelete({postId: postId});
    
    postHistory.save();

    let publicPost;
    if (post.visibility == "PUBLIC") {
        publicPost = PublicPost.findOneAndDelete({_id: postId}).clone();
    }

    await likes;
    await comments;
    await publicPost;
    return [undefined, 200]; 
}

async function getPosts(token, page, size, author) {
    if(page < 0 || size < 0){
        return [[], 400]
    }

    let login = Login.findOne({token: token});

    let aggregatePipeline = [
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
            $limit: size
        },
        {
            $group: {
                _id: null,
                posts_array: { $push: "$posts" }
            }
        },
    ];

    if(token){
        login = await login;
        if(login){
            let following = await Following.findOne({authorId: author.authorId});

            if(!following || !following.followings){
                return [{}, 401];
            }

            for(let i = 0; i < following.followings.length; i++){
                follow = following.followings[i];
                if(follow.authorId = login.authorId){
                    aggregatePipeline.splice(3, 1);
                    break;
                }
            }
        }
    }

    let posts = undefined;
    if(page > 1){
        aggregatePipeline.splice(6, 0, {
            $skip: (page - 1) * size
        })
        posts = await PostHistory.aggregate(aggregatePipeline);
    } else if (page == 1) {
        posts = await PostHistory.aggregate(aggregatePipeline);
    }
    
    if (!posts || !posts[0] || !posts[0].posts_array) { return [[], 200]; }
    
    posts = posts[0].posts_array;

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        let sanitized_posts = {
            "type": "post",
            "title": post.title,
            "id": process.env.DOMAIN_NAME + "authors/" + author.authorId + '/posts/' + post._id,
            "source": post.source,
            "origin": post.origin,
            "description": post.description,
            "contentType": post.contentType,
            "content": post.content,
            "author": author,
            "categories": post.categories,
            "count": post.commentCount,
            "likeCount": post.likesCount,
            "comments": process.env.DOMAIN_NAME + "authors/" + author.authorId + '/posts/' + post._id + '/comments/',
            "commentSrc": post.commentSrc,
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
    fetchOtherPosts,
    uploadImage,
    getImage,
    editImage
}
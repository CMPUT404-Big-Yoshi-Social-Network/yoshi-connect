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
const { PostHistory, PublicPost, Image, Inbox } = require('../scheme/post.js');
const { LikeHistory, CommentHistory } = require('../scheme/interactions.js');
const { Author, Login } = require('../scheme/author.js');
const { Follower, Following } = require('../scheme/relations.js');
const { OutgoingCredentials } = require('../scheme/server');

// UUID
const crypto = require('crypto');

// Additional Functions
const { authLogin } = require('./auth.js');
const { getAuthor } = require('./author.js');
const axios = require('axios');

async function uploadImage(url, image) {
    /**
    Description: Uploads an image related to a post made by a specific Author
    Associated Endpoint: /authors/:authorId/posts/:postId/image
    Request Type: POST 
    Request Body: { _id: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb/posts/89c546d45f564a27800838825e3dbece/image,  
                    src: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkIAAADIhkjhaDjkdHfkaSd }
    Return: 200 Status (OK) -- Successfully uploaded the image to a post made by the Author
    */
    let newImage = new Image ({
        _id: url,  
        src: image
    })
    await newImage.save()
    return [newImage, 200]
}

async function editImage(url, src) {
    /**
    Description: Edits an image associated with a specific post made by a specific Author
    Associated Endpoint: /authors/:authorId/posts/:postId/image 
    Request Type: POST
    Request Body: { _id: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb/posts/89c546d45f564a27800838825e3dbece/image }
    Return: 404 Status (Not Found) -- Image was not found
            200 Status (OK) -- Successfully edited the image from a post made by the Author
    */
    let image = await Image.findOne({_id: url});
    if (!image) { return [{}, 404]; }
    image.src = src;
    await image.save()
    return [image, 200]
}

async function getImage(url) {
    /**
    Description: Gets the image associated with post made by a specific Author
    Associated Endpoint: /authors/:authorId/posts/:postId/image
    Request Type: GET
    Request Body: { _id: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb/posts/89c546d45f564a27800838825e3dbece/image }
    Return: 404 Status (Not Found) -- Image was not found
            200 Status (OK) -- Successfully retrieved the image from a post made by the Author
    */
    let image = await Image.findOne({_id: url});
    if (!image) { return [{}, 404]; }
    return [image.src, 200];
}

async function getPost(postId, auth, author){
    /**
    Description: Gets the posts associated with postId for the Author associated with authorId
    Associated Endpoint: /authors/:authorId/posts/:postId 
    Request Type: GET
    Request Body: { authorId: 29c546d45f564a27871838825e3dbecb, postId: 902sq546w5498hea764r80re0z89becb }
    Return: 404 Status (Not Found) -- Author ID was not found or Post associated with Author was not found
            401 Status (Unauthorized) -- Authentication failed, post not visible
            200 Status (OK) -- Returns Authour's post
    */
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

    const commentHistory = await CommentHistory.findOne({postId: postId});
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
        "commentsSrc": {
            type: "comments",
            page: 1,
            side: 5,
            post: process.env.DOMAIN_NAME + "authors/" + author.authorId + "/posts/" + postId,
            id: process.env.DOMAIN_NAME + "authors/" + author.authorId + "/posts/" + postId + '/comments/',
            comments: commentHistory.comments
        },
        "published": post.published,
        "visibility": post.visibility,
        "unlisted": post.unlisted
    }
    return [post, 200]   
}

async function createPost(token, authorId, postId, newPost) {
    /**
    Description: Creates the posts associated with postId for the Author associated with authorId to create a post
    Associated Endpoint: /authors/:authorId/posts/:postId
    Request Type: PUT
    Request Body: { authorId: 29c546d45f564a27871838825e3dbecb, postId: 902sq546w5498hea764r80re0z89becb }
    Return: 401 Status (Unauthorized) -- Token expired or is not authenticated
            400 Status (Bad Request) -- Post details are invalid
            404 Status (Not Found) -- Post associated with author ID was not found
            500 Status (Internal Server Error) -- Unable to confrim post in database
            200 Status (OK) -- Returns Authour's post
    */
    if (!(await authLogin(token, authorId))) { return [[], 401]; }

    let authorPromise = getAuthor(authorId);

    const title = newPost.title;
    const description = newPost.description;
    const contentType = newPost.contentType;
    const content = newPost.content;
    const categories = newPost.categories;
    const published = new Date().toISOString();
    const visibility = newPost.visibility;
    const unlisted = newPost.unlisted;

    if (!title || !description || !contentType || !content) { return [[], 400]; }

    let postHistory = await PostHistory.findOne({authorId: authorId});
    if (!postHistory) { return [[], 404]; }

    if (postId != undefined) {
        let oldPost = postHistory.posts.id(postId);
        if (oldPost) return [[], 400];
    }
    
    if (!postId) { postId = String(crypto.randomUUID()).replace(/-/g, ""); }

    let source = process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId;
    let origin = process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId;

    let post = {
        _id: postId,
        id: process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId,
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
        author: ''
    };

    let commentsSrc = {
        type: "comments",
        page: 1,
        side: 5,
        post: process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId,
        id: process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId + '/comments/',
        comments: []
    }

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

    if (visibility == 'PUBLIC' && (unlisted == "false" || unlisted == false)) {
        post.author = {
            id: author.id,
            host: author.host,
            displayName: author.displayName,
            url: author.url,
            github: author.github,
            profileImage: author.profileImage,
            pronouns: author.pronouns,
        }
        const publicPost = new PublicPost(post);
        await publicPost.save();

        const followers = await Follower.findOne({authorId: authorId}).clone();
        post.type = "post";
        delete post._id;
        const outgoings = await OutgoingCredentials.find().clone();
        for (let i = 0; i < followers.followers.length; i++) {
            const follower = followers.followers[i];
            if (follower.id !== undefined) {
                let followerId = (follower.id.split("/authors/"))[(follower.id.split("/authors/")).length - 1];
                let followerHost = (follower.id.split("/authors/"))[0];
                let inbox = null;
                if (followerHost + '/' === process.env.DOMAIN_NAME || followerHost === 'https://yoshi-connect.herokuapp.com') {
                    inbox = await Inbox.findOne({"authorId": followerId}).clone();
                    if (inbox) {
                        inbox.posts.push(post);
                        inbox.num_posts++;
                        await inbox.save();
                    }
                }
                else if (inbox === null || inbox === undefined) {
                    let toSend = {
                        "type": "post",
                        "title" : post.title,
                        "id": process.env.DOMAIN_NAME + "authors/" + author.authorId + "/posts/" + postId,
                        "source": post.source,
                        "origin": post.origin,
                        "description": post.description,
                        "contentType": post.contentType,
                        "content": post.content,
                        "author": post.author,
                        "categories": post.categories,
                        "count": post.commentCount,
                        "likeCount": post.likeCount,
                        "comments": process.env.DOMAIN_NAME + "authors/" + author.authorId + '/posts/' + post._id + '/comments/',
                        "commentsSrc": commentsSrc,
                        "published": post.published,
                        "visibility": post.visibility,
                    }
                    for (let i = 0; i < outgoings.length; i++) {
                        if (followerHost == outgoings[i].url && outgoings[i].allowed) {
                            let config = {
                                host: outgoings[i].url,
                                url: follower.id + "/inbox",
                                method: "POST",
                                headers:{
                                    "Authorization": outgoings[i].auth,
                                    'Content-Type': 'application/json'
                                },
                                data: toSend
                            }
                            axios.request(config)
                            .then((response) => { })
                            .catch((error) => { })
                        }
                    }
                }
            }
        }
    }
    else if ((visibility === 'FRIENDS') && (unlisted == "false" || unlisted == false)) {
        const followers = await Follower.findOne({authorId: authorId}).clone();
        const followings = await Following.findOne({authorId: authorId}).clone();
        const friends = followers.followers.filter(follower => followings.followings.some(following => follower.id === following.id));
        post.type = "post";
        post.author = {
            type: "author",
            id: author.id,
            host: author.host,
            displayName: author.displayName,
            url: author.url,
            github: author.github,
            profileImage: author.profileImage,
        };
        delete post._id;
        const outgoings = await OutgoingCredentials.find().clone();
        for (let i = 0; i < friends.length; i++) {
            const friend = friends[i];
            if (friend.id !== undefined) {
                let friendId = (friend.id.split("/authors/"))[(friend.id.split("/authors/")).length - 1];
                let friendHost = (friend.id.split("/authors/"))[0];
                let inbox = null;
                if (friendHost + '/' === process.env.DOMAIN_NAME || friendHost === 'https://yoshi-connect.herokuapp.com') {
                    inbox = await Inbox.findOne({"authorId": friendId}).clone();
                    if (inbox) {
                        inbox.posts.push(post);
                        inbox.num_posts++;
                        await inbox.save();
                    }
                }
                else if (inbox === null || inbox === undefined) {
                    let toSend = {
                        "type": "post",
                        "title" : post.title,
                        "id": process.env.DOMAIN_NAME + "authors/" + author.authorId + "/posts/" + postId,
                        "source": post.source,
                        "origin": post.origin,
                        "description": post.description,
                        "contentType": post.contentType,
                        "content": post.content,
                        "author": post.author,
                        "categories": post.categories,
                        "count": post.commentCount,
                        "likeCount": post.likeCount,
                        "comments": process.env.DOMAIN_NAME + "authors/" + author.authorId + '/posts/' + post._id + '/comments/',
                        "commentsSrc": commentsSrc,
                        "published": post.published,
                        "visibility": post.visibility,
                    }
                    for (let i = 0; i < outgoings.length; i++) {
                        if (friendHost == outgoings[i].url && outgoings[i].allowed) {
                            let config = {
                                host: outgoings[i].url,
                                url: friend.id + "/inbox",
                                method: "POST",
                                headers:{
                                    "Authorization": outgoings[i].auth,
                                    'Content-Type': 'application/json'
                                },
                                data: toSend
                            }
        
                            axios.request(config)
                            .then((response) => { })
                            .catch((error) => { })
                        }
                    }
                }
            }
        }
    } else if ((visibility === 'PRIVATE') && (unlisted == "false" || unlisted == false)) {
        const followers = await Follower.findOne({authorId: authorId}).clone();
        const followings = await Following.findOne({authorId: authorId}).clone();
        const outgoings = await OutgoingCredentials.find().clone();

        const username = newPost.postTo;
        let authorTo = await Author.findOne({username: username}).clone();
        let local = true;
        let allowed = true;
        let auth = ''
        if (!authorTo) { 
            // Must be a private foreign (only to followers / followings)
            local = false;
            let foreignAuthor = '';
            for (let i = 0; i < followers.followers.length; i++) {
                if (followers.followers[i].displayName === username) { foreignAuthor = followers.followers[i] }
            }
            if (foreignAuthor === '') {
                for (let i = 0; i < followings.followings.length; i++) {
                    if (followings.followings[i].displayName === username) { foreignAuthor = followings.followings[i] }
                }
            }
            if (foreignAuthor === '') {
                return [[], 400];
            } else {
                let objectHost = foreignAuthor.id.split('/authors/')
                for (let i = 0; i < outgoings.length; i++) {
                    if (outgoings[i].url === objectHost[0]) { 
                        auth = outgoings[i].auth; 
                        allowed = outgoings[i].allowed;
                        break;
                    }
                }

                if (allowed) {
                    let config = {
                        host: objectHost[0],
                        url: foreignAuthor.id,
                        method: "GET",
                        headers:{
                            "Authorization": auth,
                            'Content-Type': 'application/json'
                        }
                    }
                    await axios.request(config)
                    .then((res) => { authorTo = res.data; })
                    .catch((err) => { })
                }
            }
        }  

        post.type = "post";
        post.author = {
            type: "author",
            id: author.id,
            host: author.host,
            displayName: author.displayName,
            url: author.url,
            github: author.github,
            profileImage: author.profileImage,
        };
        delete post._id;

        if (local) {
            let inbox = await Inbox.findOne({"authorId": authorTo._id}).clone();
            if (inbox) {
                inbox.posts.push(post);
                inbox.num_posts++;
                await inbox.save();
            }
        } else {
            let toSend = {
                "type": "post",
                "title" : post.title,
                "id": process.env.DOMAIN_NAME + "authors/" + author.authorId + "/posts/" + postId,
                "source": post.source,
                "origin": post.origin,
                "description": post.description,
                "contentType": post.contentType,
                "content": post.content,
                "author": post.author,
                "categories": post.categories,
                "count": post.commentCount,
                "likeCount": post.likeCount,
                "comments": process.env.DOMAIN_NAME + "authors/" + author.authorId + '/posts/' + post._id + '/comments/',
                "commentsSrc": commentsSrc,
                "published": post.published,
                "visibility": post.visibility,
                "unlisted": post.unlisted
            }
            if (allowed) {
                let config = {
                    host: authorTo.host,
                    url: authorTo.id + "/inbox",
                    method: "POST",
                    headers:{
                        "Authorization": auth,
                        'Content-Type': 'application/json'
                    },
                    data: toSend
                }

                axios.request(config)
                .then((response) => { })
                .catch((error) => { console.log(error) })
            }
        }
    }
        
    await likes;
    await comments;
    await savePostPromise;
    return await getPost(postId, token, author);
}

async function sharePost(authorId, token, newPost) {
    /**
    Description: Sends a POST request to share post assciated with a specific Author
    Associated Endpoint: N/A
    Request Type: POST
    Request Body: { authorId: 29c546d45f564a27871838825e3dbecb, postId: 902sq546w5498hea764r80re0z89becb }
    Return: 404 Status (Not Found) -- Post from Author was not found in the database
            500 Status (Internal Server Error) -- Unable to confrim post in database
            200 Status (OK) -- Returns Authour's post
    */
    let authorPromise = getAuthor(authorId);

    const title = newPost.title;
    const description = newPost.description;
    const contentType = newPost.contentType;
    const content = newPost.content;
    const categories = newPost.categories;
    const published = new Date().toISOString();
    const visibility = newPost.visibility;
    const unlisted = newPost.unlisted;
    const sharedPostId = String(crypto.randomUUID()).replace(/-/g, "");
    const source = process.env.DOMAIN_NAME + 'authors/' + authorId + '/posts/' + sharedPostId;
    const origin = newPost.origin;

    let postHistory = await PostHistory.findOne({authorId: authorId});
    if (!postHistory) { return [[], 404]; }

    let post = {
        _id: sharedPostId,
        id: process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + sharedPostId,
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
        author: ''
    };

    postHistory.posts.push(post);
    postHistory.num_posts = postHistory.num_posts + 1;

    let savePostPromise = postHistory.save();

    let likes = LikeHistory({
        type: "post",
        Id: sharedPostId,
        likes: [],
    }).save();

    let comments = CommentHistory({
        postId: sharedPostId,
        comments: [],
    }).save();

    let [author, status] = await authorPromise;
    if (status != 200) return [{}, 500];

    if (visibility == 'PUBLIC' && (unlisted == "false" || unlisted == false)) {
        post.author = {
            _id: author.id,
            host: author.host,
            displayName: author.displayName,
            url: author.url,
            github: author.github,
            profileImage: author.profileImage,
            pronouns: author.pronouns,
        }
        const publicPost = new PublicPost(post);
        await publicPost.save();

        const followers = await Follower.findOne({authorId: authorId}).clone();
        post.type = "post";
        post.author = {
            type: "author",
            id: author.id,
            host: author.host,
            displayName: author.displayName,
            url: author.url,
            github: author.github,
            profileImage: author.profileImage,
        };
        delete post._id;
        const outgoings = await OutgoingCredentials.find().clone();
        for (let i = 0; i < followers.followers.length; i++) {
            const follower = followers.followers[i];
            if (follower.id !== undefined) {
                let followerId = (follower.id.split("/authors/"))[(follower.id.split("/authors/")).length - 1];
                let followerHost = (follower.id.split("/authors/"))[0];
                let inbox = null;
                if (followerHost + '/' === process.env.DOMAIN_NAME || followerHost === 'https://yoshi-connect.herokuapp.com') {
                    inbox = await Inbox.findOne({"authorId": followerId}).clone();
                    if (inbox) {
                        inbox.posts.push(post);
                        inbox.num_posts++;
                        await inbox.save();
                    }
                }
                else if (inbox === null || inbox === undefined) {
                    let toSend = {
                        "type": "post",
                        "title" : post.title,
                        "id": process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + sharedPostId,
                        "source": post.source,
                        "origin": post.origin,
                        "description": post.description,
                        "contentType": post.contentType,
                        "content": post.content,
                        "author": post.author,
                        "categories": post.categories,
                        "count": post.commentCount,
                        "likeCount": post.likeCount,
                        "comments": process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + sharedPostId + '/comments/',
                        "commentsSrc": {
                            type: "comments",
                            page: 1,
                            side: 5,
                            post: process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + sharedPostId,
                            id: process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + sharedPostId + '/comments/',
                            comments: comments.comments
                        },
                        "published": post.published,
                        "visibility": post.visibility,
                    }
                    for (let i = 0; i < outgoings.length; i++) {
                        if (followerHost == outgoings[i].url && outgoings[i].allowed) {
                            let config = {
                                host: outgoings[i].url,
                                url: follower.id + "/inbox",
                                method: "POST",
                                headers:{
                                    "Authorization": outgoings[i].auth,
                                    'Content-Type': 'application/json'
                                },
                                data: toSend
                            }
        
                            axios.request(config)
                            .then((response) => { })
                            .catch((error) => { })
                        }
                    }
                }
            }
        }
    }
    else if ((visibility === 'FRIENDS') && (unlisted == "false" || unlisted == false)) {
        const followers = await Follower.findOne({authorId: authorId}).clone();
        const followings = await Following.findOne({authorId: authorId}).clone();
        const friends = followers.followers.filter(follower => followings.followings.some(following => follower.id === following.id));
        post.type = "post";
        post.author = {
            type: "author",
            id: author.id,
            host: author.host,
            displayName: author.displayName,
            url: author.url,
            github: author.github,
            profileImage: author.profileImage,
        };
        delete post._id;
        const outgoings = await OutgoingCredentials.find().clone();
        for (let i = 0; i < friends.length; i++) {
            const friend = friends[i];
            if (friend.id !== undefined) {
                let friendId = (friend.id.split("/authors/"))[(friend.id.split("/authors/")).length - 1];
                let friendHost = (friend.id.split("/authors/"))[0];
                let inbox = null;
                if (friendHost + '/' === process.env.DOMAIN_NAME || friendHost === 'https://yoshi-connect.herokuapp.com') {
                    inbox = await Inbox.findOne({"authorId": friendId}).clone();
                    if (inbox) {
                        inbox.posts.push(post);
                        inbox.num_posts++;
                        await inbox.save();
                    }
                }
                else if (inbox === null || inbox === undefined) {
                    let toSend = {
                        "type": "post",
                        "title" : post.title,
                        "id": process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + sharedPostId,
                        "source": post.source,
                        "origin": post.origin,
                        "description": post.description,
                        "contentType": post.contentType,
                        "content": post.content,
                        "author": post.author,
                        "categories": post.categories,
                        "count": post.commentCount,
                        "likeCount": post.likeCount,
                        "comments": process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + sharedPostId + '/comments/',
                        "commentsSrc": {
                            type: "comments",
                            page: 1,
                            side: 5,
                            post: process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + sharedPostId,
                            id: process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + sharedPostId + '/comments/',
                            comments: comments.comments
                        },
                        "published": post.published,
                        "visibility": post.visibility,
                    }
                    for (let i = 0; i < outgoings.length; i++) {
                        if (friendHost == outgoings[i].url && outgoings[i].allowed) {
                            let config = {
                                host: outgoings[i].url,
                                url: friend.id + "/inbox",
                                method: "POST",
                                headers:{
                                    "Authorization": outgoings[i].auth,
                                    'Content-Type': 'application/json'
                                },
                                data: toSend
                            }
        
                            axios.request(config)
                            .then((response) => { })
                            .catch((error) => { })
                        }
                    }
                }
            }
        }
    } else if ((visibility === 'PRIVATE') && (unlisted == "false" || unlisted == false)) {
        const followers = await Follower.findOne({authorId: authorId}).clone();
        const followings = await Following.findOne({authorId: authorId}).clone();
        const outgoings = await OutgoingCredentials.find().clone();

        const username = newPost.postTo;
        let authorTo = await Author.findOne({username: username}).clone();
        let local = true;
        let allowed = true;
        let auth = ''
        if (!author) { 
            // Must be a private foreign (only to followers / followings)
            local = false;
            let foreignAuthor = '';
            for (let i = 0; i < followers.followers.length; i++) {
                if (followers.followers[i].displayName === username) { foreignAuthor = followers.followers[i] }
            }
            if (foreignAuthor === '') {
                for (let i = 0; i < followings.followings.length; i++) {
                    if (followings.followings[i].displayName === username) { foreignAuthor = followings.followings[i] }
                }
            }
            if (foreignAuthor === '') {
                return res.sendStatus(400);
            } else {
                let objectHost = foreignAuthor.id.split('/authors/')
                for (let i = 0; i < outgoings.length; i++) {
                    if (outgoings[i].url === objectHost[0]) { 
                        auth = outgoings[i].auth; 
                        allowed = outgoings[i].allowed;
                        break;
                    }
                }

                if (allowed) {
                    let config = {
                        host: objectHost[0],
                        url: foreignAuthor.id,
                        method: "GET",
                        headers:{
                            "Authorization": auth,
                            'Content-Type': 'application/json'
                        }
                    }
                    await axios.request(config)
                    .then((res) => { authorTo = res.data; })
                    .catch((err) => { })
                }
            }
        }  

        post.type = "post";
        post.author = {
            type: "author",
            id: author.id,
            host: author.host,
            displayName: author.displayName,
            url: author.url,
            github: author.github,
            profileImage: author.profileImage,
        };
        delete post._id;

        if (local) {
            let inbox = await Inbox.findOne({"authorId": authorTo._id}).clone();
            if (inbox) {
                inbox.posts.push(post);
                inbox.num_posts++;
                await inbox.save();
            }
        } else {
            if (allowed) {
                let toSend = {
                    "type": "post",
                    "title" : post.title,
                    "id": process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + sharedPostId,
                    "source": post.source,
                    "origin": post.origin,
                    "description": post.description,
                    "contentType": post.contentType,
                    "content": post.content,
                    "author": post.author,
                    "categories": post.categories,
                    "count": post.commentCount,
                    "likeCount": post.likeCount,
                    "comments": process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + sharedPostId + '/comments/',
                    "commentsSrc": {
                        type: "comments",
                        page: 1,
                        side: 5,
                        post: process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + sharedPostId,
                        id: process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + sharedPostId + '/comments/',
                        comments: comments.comments
                    },
                    "published": post.published,
                    "visibility": post.visibility,
                }
                let config = {
                    host: authorTo.host,
                    url: authorTo.id + "/inbox",
                    method: "POST",
                    headers:{
                        "Authorization": auth,
                        'Content-Type': 'application/json'
                    },
                    data: toSend
                }

                axios.request(config)
                .then((response) => { })
                .catch((error) => { })
            }
        }
    }
        
    await likes;
    await comments;
    await savePostPromise;
    return await getPost(sharedPostId, token, author);
}

async function updatePost(token, authorId, postId, newPost) {
    /**
    Description: Sends the posts associated with postId for the Author associated with authorId to update the post
    Associated Endpoint: /authors/:authorId/posts/:postId
    Request Type: POST 
    Request Body: { authorId: 29c546d45f564a27871838825e3dbecb, postId: 902sq546w5498hea764r80re0z89becb }
    Return: 401 Status (Unauthorized) -- Token expired or is not authenticated
            400 Status (Not Found) -- Post details are invalid
            500 Status (Internal Server Error) -- Unable to fetch post history from database
            200 Status (OK) -- Returns a JSON of the updated post object
    */
    if (!(await authLogin(token, authorId))) { return [{}, 401]; }

    let authorPromise = getAuthor(authorId);
    let [author, status] = await authorPromise;
    if (status != 200) return [{}, 500];

    const title = newPost.title;
    const description = newPost.description;
    const contentType = newPost.contentType;
    const content = newPost.content;
    const categories = newPost.categories;
    const visibility = newPost.visibility;
    const unlisted = newPost.unlisted;

    let commentHistory = await CommentHistory.findOne({postId: postId});

    if (!title || !description || !contentType || !content) { return [{}, 400]; }

    const postHistory = await PostHistory.findOne({authorId: authorId});
    if (!postHistory) { return [{}, 500]; }
    let post = postHistory.posts.id(postId);
    post.title = title;
    post.description = description;
    post.contentType = contentType;
    post.content = content;
    post.visibility = visibility;
    post.unlisted = unlisted;
    post.categories = categories;
    await postHistory.save();

    let publicPost = await PublicPost.findOne({_id: postId}).clone();
    if (publicPost) {
        if (newPost.unlisted || newPost.visibility === 'FRIENDS' || newPost.visibility === 'PRIVATE') {
            await PublicPost.findOneAndDelete({_id: postId}).clone();
        } else {
            publicPost.title = title;
            publicPost.description = description;
            publicPost.contentType = contentType;
            publicPost.content = content;
            publicPost.visibility = visibility;
            publicPost.categories = categories;
            await publicPost.save();

            const followers = await Follower.findOne({authorId: authorId}).clone();
            post.type = "post";
            post.id = newPost.id;
            post.author = {
                type: "author",
                id: author.id,
                host: author.host,
                displayName: author.displayName,
                url: author.url,
                github: author.github,
                profileImage: author.profileImage,
            };
            delete post._id;
            const outgoings = await OutgoingCredentials.find().clone();
            for (let i = 0; i < followers.followers.length; i++) {
                const follower = followers.followers[i];
                if (follower.id !== undefined) {
                    let followerId = (follower.id.split("/authors/"))[(follower.id.split("/authors/")).length - 1];
                    let followerHost = (follower.id.split("/authors/"))[0];
                    let inbox = null;
                    if (followerHost + '/' === process.env.DOMAIN_NAME || followerHost === 'https://yoshi-connect.herokuapp.com') {
                        inbox = await Inbox.findOne({"authorId": followerId}).clone();
                        if (inbox) {
                            inbox.posts.push(post);
                            inbox.num_posts++;
                            await inbox.save();
                        }
                    }
                    else if (inbox === null || inbox === undefined) {
                        let toSend = {
                            "type": "post",
                            "title" : post.title,
                            "id": process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId,
                            "source": post.source,
                            "origin": post.origin,
                            "description": post.description,
                            "contentType": post.contentType,
                            "content": post.content,
                            "author": post.author,
                            "categories": post.categories,
                            "count": post.commentCount,
                            "likeCount": post.likeCount,
                            "comments": process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId + '/comments/',
                            "commentsSrc": {
                                type: "comments",
                                page: 1,
                                side: 5,
                                post: process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId,
                                id: process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId + '/comments/',
                                comments: commentHistory.comments
                            },
                            "published": post.published,
                            "visibility": post.visibility,
                        }
                        for (let i = 0; i < outgoings.length; i++) {
                            if (followerHost == outgoings[i].url && outgoings[i].allowed) {
                                let config = {
                                    host: outgoings[i].url,
                                    url: follower.id + "/inbox",
                                    method: "POST",
                                    headers:{
                                        "Authorization": outgoings[i].auth,
                                        'Content-Type': 'application/json'
                                    },
                                    data: toSend
                                }
            
                                axios.request(config)
                                .then((response) => { })
                                .catch((error) => { })
                            }
                        }
                    }
                }
            }
        }
    }
    else if (!publicPost && (unlisted == 'false' || unlisted == false) && visibility == "PUBLIC") {
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
            unlisted: unlisted
        };
        await (new PublicPost(publicPost)).save(); 

        const followers = await Follower.findOne({authorId: authorId}).clone();
        post.type = "post";
        post.id = newPost.id;
        post.author = {
            type: "author",
            id: author.id,
            host: author.host,
            displayName: author.displayName,
            url: author.url,
            github: author.github,
            profileImage: author.profileImage,
        };
        delete post._id;
        const outgoings = await OutgoingCredentials.find().clone();
        for (let i = 0; i < followers.followers.length; i++) {
            const follower = followers.followers[i];
            if (follower.id !== undefined) {
                let followerId = (follower.id.split("/authors/"))[(follower.id.split("/authors/")).length - 1];
                let followerHost = (follower.id.split("/authors/"))[0];
                let inbox = null;
                if (followerHost + '/' === process.env.DOMAIN_NAME || followerHost === 'https://yoshi-connect.herokuapp.com') {
                    inbox = await Inbox.findOne({"authorId": followerId}).clone();
                    if (inbox) {
                        inbox.posts.push(post);
                        inbox.num_posts++;
                        await inbox.save();
                    }
                }
                else if (inbox === null || inbox === undefined) {
                    let toSend = {
                        "type": "post",
                        "title" : post.title,
                        "id": process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId,
                        "source": post.source,
                        "origin": post.origin,
                        "description": post.description,
                        "contentType": post.contentType,
                        "content": post.content,
                        "author": post.author,
                        "categories": post.categories,
                        "count": post.commentCount,
                        "likeCount": post.likeCount,
                        "comments": process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId + '/comments/',
                        "commentsSrc": {
                            type: "comments",
                            page: 1,
                            side: 5,
                            post: process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId,
                            id: process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId + '/comments/',
                            comments: commentHistory.comments
                        },
                        "published": post.published,
                        "visibility": post.visibility,
                    }
                    for (let i = 0; i < outgoings.length; i++) {
                        if (followerHost == outgoings[i].url && outgoings[i].allowed) {
                            let config = {
                                host: outgoings[i].url,
                                url: follower.id + "/inbox",
                                method: "POST",
                                headers:{
                                    "Authorization": outgoings[i].auth,
                                    'Content-Type': 'application/json'
                                },
                                data: toSend
                            }
        
                            axios.request(config)
                            .then((response) => { })
                            .catch((error) => { })
                        }
                    }
                }
            }
        }
    }

    if (newPost.visibility === 'FRIENDS' && (unlisted == 'false' || unlisted == false)) {
        const followers = await Follower.findOne({authorId: authorId}).clone();
        const followings = await Following.findOne({authorId: authorId}).clone();
        const friends = followers.followers.filter(follower => followings.followings.some(following => follower.id === following.id));
        post.type = "post";
        post.id = newPost.id;
        post.author = {
            type: "author",
            id: author.id,
            host: author.host,
            displayName: author.displayName,
            url: author.url,
            github: author.github,
            profileImage: author.profileImage,
        };
        delete post._id;
        const outgoings = await OutgoingCredentials.find().clone();
        for (let i = 0; i < friends.length; i++) {
            const friend = friends[i];
            if (friend.id !== undefined) {
                let friendId = (friend.id.split("/authors/"))[(friend.id.split("/authors/")).length - 1];
                let friendHost = (friend.id.split("/authors/"))[0];
                let inbox = null;
                if (friendHost + '/' === process.env.DOMAIN_NAME || friendHost === 'https://yoshi-connect.herokuapp.com') {
                    inbox = await Inbox.findOne({"authorId": friendId}).clone();
                    if (inbox) {
                        inbox.posts.push(post);
                        inbox.num_posts++;
                        await inbox.save();
                    }
                }
                else if (inbox === null || inbox === undefined) {
                    let toSend = {
                        "type": "post",
                        "title" : post.title,
                        "id": process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId,
                        "source": post.source,
                        "origin": post.origin,
                        "description": post.description,
                        "contentType": post.contentType,
                        "content": post.content,
                        "author": post.author,
                        "categories": post.categories,
                        "count": post.commentCount,
                        "likeCount": post.likeCount,
                        "comments": process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId + '/comments/',
                        "commentsSrc": {
                            type: "comments",
                            page: 1,
                            side: 5,
                            post: process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId,
                            id: process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId + '/comments/',
                            comments: commentHistory.comments
                        },
                        "published": post.published,
                        "visibility": post.visibility,
                    }
                    for (let i = 0; i < outgoings.length; i++) {
                        if (friendHost == outgoings[i].url && outgoings[i].allowed) {
                            let config = {
                                host: outgoings[i].url,
                                url: friend.id + "/inbox",
                                method: "POST",
                                headers:{
                                    "Authorization": outgoings[i].auth,
                                    'Content-Type': 'application/json'
                                },
                                data: toSend
                            }
        
                            axios.request(config)
                            .then((response) => { })
                            .catch((error) => { })
                        }
                    }
                }
            }
        }
    } else if (newPost.visibility === 'PRIVATE' && (unlisted == 'false' || unlisted == false)) {
        const followers = await Follower.findOne({authorId: authorId}).clone();
        const followings = await Following.findOne({authorId: authorId}).clone();
        const outgoings = await OutgoingCredentials.find().clone();

        const username = newPost.postTo;
        let authorTo = await Author.findOne({username: username}).clone();
        let local = true;
        let allowed = true;
        let auth = ''
        if (!authorTo) { 
            // Must be a private foreign (only to followers / followings)
            local = false;
            let foreignAuthor = '';
            for (let i = 0; i < followers.followers.length; i++) {
                if (followers.followers[i].displayName === username) { foreignAuthor = followers.followers[i] }
            }
            if (foreignAuthor === '') {
                for (let i = 0; i < followings.followings.length; i++) {
                    if (followings.followings[i].displayName === username) { foreignAuthor = followings.followings[i] }
                }
            }
            if (foreignAuthor === '') {
                return res.sendStatus(400);
            } else {
                let objectHost = foreignAuthor.id.split('/authors/')
                for (let i = 0; i < outgoings.length; i++) {
                    if (outgoings[i].url === objectHost[0]) { 
                        auth = outgoings[i].auth; 
                        allowed = outgoings[i].allowed;
                        break;
                    }
                }

                if (allowed) {
                    let config = {
                        host: objectHost[0],
                        url: foreignAuthor.id,
                        method: "GET",
                        headers:{
                            "Authorization": auth,
                            'Content-Type': 'application/json'
                        }
                    }
                    await axios.request(config)
                    .then((res) => { authorTo = res.data; })
                    .catch((err) => { })
                }
            }
        }  

        post.type = "post";
        post.id = newPost.id;
        post.author = {
            type: "author",
            id: author.id,
            host: author.host,
            displayName: author.displayName,
            url: author.url,
            github: author.github,
            profileImage: author.profileImage,
        };
        delete post._id;

        if (local) {
            let inbox = await Inbox.findOne({"authorId": authorTo._id}).clone();
            if (inbox) {
                inbox.posts.push(post);
                inbox.num_posts++;
                await inbox.save();
            }
        } else {
            if (allowed) {
                let toSend = {
                    "type": "post",
                    "title" : post.title,
                    "id": process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId,
                    "source": post.source,
                    "origin": post.origin,
                    "description": post.description,
                    "contentType": post.contentType,
                    "content": post.content,
                    "author": post.author,
                    "categories": post.categories,
                    "count": post.commentCount,
                    "likeCount": post.likeCount,
                    "comments": process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId + '/comments/',
                    "commentsSrc": {
                        type: "comments",
                        page: 1,
                        side: 5,
                        post: process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId,
                        id: process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId + '/comments/',
                        comments: commentHistory.comments
                    },
                    "published": post.published,
                    "visibility": post.visibility,
                }
                let config = {
                    host: authorTo.host,
                    url: authorTo.id + "/inbox",
                    method: "POST",
                    headers:{
                        "Authorization": auth,
                        'Content-Type': 'application/json'
                    },
                    data: toSend
                }

                axios.request(config)
                .then((response) => { })
                .catch((error) => { })
            }
        }
    }

    return await getPost(postId, token, author);
}

async function createTombstone(authorId, postId) {
    const phShared = await PostHistory.findOne({authorId: authorId});

    if (!phShared) { return [{}, 404]; }

    const pShared = postHistory.posts.id(postId);

    if(!pShared) { return [{}, 404]; }

    pShared.title = 'Shared Post Deleted!'
    pShared.description = 'Sorry, but the original post has been deleted! -- YoshiConnect'
    pShared.contentType = 'text/plain'
    pShared.content = 'RIP Shared Post'
    // TODO: Need to address the image for the tombstone for a deleted shared post

    await phShared.save();
}

async function deletePost(token, authorId, postId) {
    /**
    Description: Deletes the posts associated with postId for the Author associated with authorId to delete the post
    Associated Endpoint: /authors/:authorId/posts/:postId
    Request Type: DELETE
    Request Body: { authorId: 29c546d45f564a27871838825e3dbecb, postId: 902sq546w5498hea764r80re0z89becb }
    Return: 401 Status (Unauthorized) -- Author token is not authenticated
            404 Status (Not Found) -- Post was not found
            200 Status (OK) -- Successfully deleted post object from database
    */
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
    /**
    Description: Gets the posts associated with authorId for the Author themselves
    Associated Endpoint: /authors/:authorId/posts/personal
    Request Type: GET
    Request Body: { authorId: 29c546d45f564a27871838825e3dbecb, postId: 902sq546w5498hea764r80re0z89becb }
    Return: 400 Status (Bad Request) -- Invalid post
            401 Status (Unauthorized) -- Author is not a follower or friend
            200 Status (OK) -- Returns the post associated with author ID
    */
    if(page < 0 || size < 0){
        return [[], 400]
    }

    page = parseInt(page);
    size = parseInt(size);

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
            $limit: size ? size : 5
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
            "likeCount": post.likeCount,
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
    /**
    Description: Gets the Author's posts for themselves
    Associated Endpoint: N/A
    Request Type: GET
    Request Body: { authorId: 29c546d45f564a27871838825e3dbecb, postId: 902sq546w5498hea764r80re0z89becb }
    Return: 200 Status (OK) -- Returns a JSON with an array of the Author's posts
    */
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
    /**
    Description: Gets other Author's posts
    Associated Endpoint: N/A
    Request Type: GET
    Request Body: { authorId: 29c546d45f564a27871838825e3dbecb, postId: 902sq546w5498hea764r80re0z89becb }
    Return: 200 Status (OK) -- Returns a JSON with an array of the other Author's posts
    */
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
    sharePost,
    fetchMyPosts,
    fetchOtherPosts,
    uploadImage,
    getImage,
    editImage,
    createTombstone
}

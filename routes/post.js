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
const { OutgoingCredentials } = require('../scheme/server');


// UUID
const crypto = require('crypto');

// Additional Functions
const { authLogin } = require('./auth.js');
const { getAuthor } = require('./author.js');

async function createPostHistory(author_id){
    /**
    Description: Creates the Author's post history
    Associated Endpoint: N/A
    Request Type: PUT
    Request Body: {_id: 08a779b240624ff899823d1024ff3aa1,
                    authorId: 29c546d45f564a27871838825e3dbecb ,
                    num_posts: 0,
                    posts: [] }
    Return: N/A
    */
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
        "shared": post.shared,
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

    if(!title || !description || !contentType || !content || !categories || (visibility != "PUBLIC" && visibility != "FRIENDS") || (unlisted != 'true' && unlisted != 'false' && unlisted != true && unlisted != false)){
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
            host: author.host,
            displayName: author.displayName,
            url: author.url,
            github: author.github,
            profileImage: author.profileImage,
            pronouns: author.pronouns,
        }
        const publicPost = new PublicPost(post);
        await publicPost.save();
    }

    //TODO make this faster
    //if not unlisted send to all followers 
    if((visibility !== 'PRIVATE') && (unlisted == "false" || unlisted == false)){
        const followers = await Follower.findOne({authorId: authorId}).clone();
        for(let i = 0; i < followers.followers.length; i++){
            /*
            post._id = process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + post._id;
            const follower = followers.followers[i].authorId;
            const inbox = await Inbox.findOne({authorId: follower}, "_id authorId posts").clone();
            inbox.posts.push(post);
            await inbox.save();
            */
            post.type = "post";
            post.id = process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + post._id;
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

            //Send the post to other followers 
            const follower = followers.followers[i];
            const hosts = await getHostNames();
            //TODO NEEDS TESTING
            let followerHost = follower.id.split("/");
            followerHost = followerHost[2];
            for(let i = 0; i < hosts.length; i++){
                if(i == 0 && followerHost == hosts[i].host){
                    post._id = process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + post._id;
                    const followerId = followers.followers[i].authorId;
                    const inbox = await Inbox.findOne({"authorId": followerId}).clone();

                    inbox.posts.push(post);
                    inbox.num_posts++;
                    await inbox.save();
                }
                else if(followerHost == followerHost[i]){
                    let host = followerHost[i];
                    let config = {
                        url: follower.id + "/inbox",
                        method: "post",
                        headers:{
                            "Authorization": host.auth,
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        data: post
                    }

                    axios.request(config)
                    .then((request) => {
                        console.log(request.data);
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
            }
        }
    }
        
    await likes;
    await comments;
    await savePostPromise;
    return await getPost(postId, authorId, author);
}

async function getHostNames(){
    /**
    Description: Gets the host names
    Associated Endpoint: N/A
    Request Type: GET
    Request Body: N/A
    Return: N/A
    */
    let hosts = [];

    let currHost = process.env.DOMAIN_NAME.split("/");
    hosts.push({host: currHost[2]});

    let outs = await OutgoingCredentials.find().clone();
    for(let i = 0; i < outs.length; i++){
        let out = outs[i];
        let foreignHost = out.url.split("/");
        hosts.push({...out, host: foreignHost[2]});
    }

    return hosts;
}

async function sharePost(token, authorId, postId, newPost) {
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
    let postFrom = '';
    if (newPost.authorId === undefined) {
        postFrom = newPost.source
        postFrom = postFrom.split("/");
        postFrom = postFrom[postFrom.length - 3];
    } else {
        postFrom = newPost.authorId
    }
    const sharedPostId = String(crypto.randomUUID()).replace(/-/g, ""); 
    const origin = newPost.origin;

    let postHistory = await PostHistory.findOne({authorId: authorId});
    if (!postHistory) { return [[], 404]; }

    let source = newPost.author._id + '/posts/' + newPost.postId;

    const originalPH = await PostHistory.findOne({authorId: postFrom});
    const originalPost = originalPH.posts.id(newPost.postId);
    originalPost.whoShared.push({
        authorId: authorId, 
        host: process.env.DOMAIN_NAME,
        postId: sharedPostId
    });

    let post = {
        _id: sharedPostId,
        title: title,
        source: source,
        origin: origin,
        description: description,
        contentType: contentType,
        content: content,
        categories: categories,
        likeCount: 0,
        commentCount: 0,
        published: published,
        visibility: visibility,
        unlisted: unlisted,
        whoShared: [],
        shared: true,
        postFrom: postFrom,
        author: null
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
    if((visibility !== 'PRIVATE') && (unlisted == "false" || unlisted == false)){
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
    return await getPost(sharedPostId, authorId, author);
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
    const title = newPost.title;
    const description = newPost.description;
    const contentType = newPost.contentType;
    const content = newPost.content;
    const categories = newPost.categories;
    const visibility = newPost.visibility;
    const unlisted = newPost.unlisted;
    console.log(newPost)

    if(!title || !description || !contentType || !content || !categories){
        return [{}, 400];
    }

    console.log(authorId)
    const postHistory = await PostHistory.findOne({authorId: authorId});
    console.log(postHistory)

    if (!postHistory) { return [{}, 500]; }

    let post = postHistory.posts.id(postId);
    console.log(post)
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
            shared: post.shared,
            unlisted: unlisted,
            postFrom: post.postFrom
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

    let author = await getAuthor(authorId);
    return await getPost(postId, token, author[0]);
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

    if (post.whoShared != []) {
            const whoShared = post.whoShared; 
            const outgoings = await OutgoingCredentials.find().clone();
            for (let i = 0; i < whoShared.length; i++) {
                const node = outgoings.find(item => item.url === whoShared[i].host)
                if (node === undefined) {
                    await createTombstone(authorId, postId);
                }
            }
        }


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
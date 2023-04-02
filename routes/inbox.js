// Database
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

// Schemes
const { Post, Inbox, PostHistory } = require('../scheme/post.js');
const { Like, Comment, CommentHistory } = require('../scheme/interactions.js');
const { Request } = require('../scheme/relations.js');

// UUID
const crypto = require('crypto');

// Other routes functions
const { addLike, addLiked } = require('./likes.js');
const { createComment } = require('./comment.js');
const { validateAuthorObject } = require('./author.js');
const axios = require('axios');

// Additional Functions
const { authLogin } = require('./auth.js');

async function getInbox(token, authorId, page, size){
    /**
    Description: 
    Associated Endpoint: (for example: /authors/:authorid)
    Request Type: 
    Request Body: (for example: { username: kc, email: 123@aulenrta.ca })
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
    */
    if( ! (await authLogin(token, authorId))){
        return [{}, 401];
    }

    if(page == undefined) { page = 1; }
    if(size == undefined) { size = 5; }
    page = parseInt(page);
    size = parseInt(size);

    let posts;
    //TODO reduce code duplication
    if(page > 1){
        posts = await Inbox.aggregate([
            {
                $match: {'authorId': authorId}
            },
            {
                $unwind: '$posts'
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
        posts = await Inbox.aggregate([
            {
                $match: {'authorId': authorId}
            },
            {
                $unwind: '$posts'
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

    if(!posts || !posts[0]){
        posts = [];
    }
    else{
        posts = posts[0].posts_array
    }

    let promiseQueue = [];
    for(let i = 0; i < posts.length; i++){
        promiseQueue.push(axios.get(posts[i]._id)
        .then((response) => {
            console.log(response.data);
            return response.data
        })
        .catch((err) => {
            console.log(err);
        }))
    }

    for(let i = 0; i < posts.length; i++){
        let updatedPost = await promiseQueue[i];
        let post;
        if(!updatedPost){
            post = posts[i];
        }
        else{
            post = updatedPost;
            post.author._id = post.author.id;
            post.commentCount = post.count
        }
        posts[i] = {
            "type": "post",
            "title": post.title,
            "id": !updatedPost ? post.author._id + '/posts/' + post._id : post.id,
            "source": post.source,
            "origin": post.origin,
            "description": post.description,
            "contentType": post.contentType,
            "content": post.content,
            "author": {
                type: "author",
                id: post.author._id,
                host: post.author.host,
                displayName: post.author.displayName,
                profileImage: post.author.profileImage,
                url: post.author.url,
                github: post.author.github,
            },
            "categories": post.categories,
            "count": post.commentCount ? post.commentCount : 0,
            "likeCount": post.likeCount ? post.likeCount : 0,
            "comments": post.author._id + '/posts/' + post._id + '/comments/',
            "commentSrc": post.commentSrc,
            "published": post.published,
            "visibility": post.visibility,
            "unlisted": post.unlisted,
        }
    }

    let response = {
        type: "inbox",
        author: process.env.DOMAIN_NAME + "authors/" + authorId,
        items: posts
    };

    return [response, 200];
}

async function postInboxPost(post, recieverAuthorId){
    /**
    Description: 
    Associated Endpoint: (for example: /authors/:authorid)
    Request Type: 
    Request Body: (for example: { username: kc, email: 123@aulenrta.ca })
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
    */
    let postFrom = '' // Need to discuss wherther other teams will follow this
    if (post.authorId === undefined) {
        postFrom = post.author.id
        postFrom = postFrom.split("/");
        postFrom = postFrom[postFrom.length - 1];
    } else {
        postFrom = post.authorId
    }
    if (post.id === undefined) {
        post = (await createPost(null, post.authorId, post.id, {...post, postFrom: postFrom}))[0];
    }
    const type = post.type;
    const title = post.title;
    const id = post.id;
    const source = post.source;
    const origin = post.origin;
    const description = post.description;
    const contentType = post.contentType;
    const content = post.content;
    const authorType = post.author.type;
    const authorId = post.author.id;
    const authorHost = post.author.host;
    const authorDisplayName = post.author.displayName;
    const authorUrl = post.author.url;
    const authorGithub = post.author.github;
    const authorProfileImage = post.author.profileImage;
    const categories = post.categories;
    const published = post.published;
    const visibility = post.visibility;
    const unlisted = post.unlisted;

    if( !type || !title || !id || !source || !origin || !description || !contentType || !content || !authorType || !authorId ||
        !authorHost || !authorDisplayName || !authorUrl || !authorGithub || !authorProfileImage || !categories || 
        !published || !visibility || !unlisted)
    {
        return [{}, 400];
    }

    const inbox = await Inbox.findOne({authorId: recieverAuthorId}, '_id posts');

    post._id = id
    inbox.posts.push(post);
    await inbox.save();
    delete post._id;
    return [post, 200]
}

async function postInboxLike(like, authorId){
    /**
    Description: 
    Associated Endpoint: (for example: /authors/:authorid)
    Request Type: 
    Request Body: (for example: { username: kc, email: 123@aulenrta.ca })
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
    */

    authorId = authorId.split("/");
    authorId = authorId[authorId.length - 1];

    const inbox = await Inbox.findOne({authorId: authorId}, '_id likes');
    let author = like.author;
    if(!validateAuthorObject(author)){
        return [{}, 400];
    }

    author = {
        _id: author.id,
        host: author.host,
        displayName: author.displayName,
        url: author.url,
        github: author.github, 
        profileImage: author.profileImage
    };

    //Add a like to the authors post/comment
    if(await addLiked(author._id, like.object)){
        return [like, 403];
    }
    await addLike(like, authorId);
    
    
    //TODO Unliking should also be added

    const inboxLike = {
        author: author,
        object: like.object,
        summary: like.summary
    }

    inbox.likes.push(inboxLike);

    inbox.save();

    return [like, 200];
}

async function postInboxComment(newComment, recieverAuthorId){
    /**
    Description: 
    Associated Endpoint: (for example: /authors/:authorid)
    Request Type: 
    Request Body: (for example: { username: kc, email: 123@aulenrta.ca })
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
    */
    if(!newComment){
        return [{}, 400];
    }
    let id = newComment.id;
    let object = newComment.object;
    if(!id && !object){
        return [{}, 400];
    }
    const type = newComment.type;
    const author = newComment.author;
    if(!validateAuthorObject(author)){
        return [{}, 500];
    }
    author._id = author.id
    const commentContent = newComment.comment;
    const contentType = newComment.contentType;
    const published = new Date().toISOString();
    if(!type || !commentContent || !contentType){
        return [{}, 400];
    }

    let commentId;
    let postId;
    let authorId;
    if(object){
        object = object.split("/");
        commentId = String(crypto.randomUUID()).replace(/-/g, "");
        postId = object[object.length - 1]; 
        authorId = object[object.length - 3];
    }
    else{
        id = id.split("/");
        commentId = id[id.length - 1];
        postId = id[id.length - 3];
        authorId = id[id.length - 5];
    }

    const postHistory = await PostHistory.findOne({authorId: authorId});
    const post = postHistory.posts.id(postId);
    if(!post){ return [{}, 404]; }
    post.commentCount++;
    await postHistory.save();
    
    const commentHistory = await CommentHistory.findOne({postId: postId});
    if(!commentHistory){ return [{}, 500]; }
    if(commentHistory.comments.id(commentId)){ return [{}, 400]; }

    let comment = {
        _id: commentId,
        author: author,
        comment: commentContent,
        contentType: contentType,
        published: published,
    }

    commentHistory.comments.push(comment);
    await commentHistory.save();

    comment._id = process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId + "/comments/" + commentId;
    comment.object = process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + postId;

    const inbox = await Inbox.findOne({authorId: recieverAuthorId});

    inbox.comments.push(comment);
    await inbox.save();

    delete comment.author._id;

    return [comment, 200];
}

async function deleteInbox(token, authorId){
    /**
    Description: 
    Associated Endpoint: (for example: /authors/:authorid)
    Request Type: 
    Request Body: (for example: { username: kc, email: 123@aulenrta.ca })
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
    */
    if (!(await authLogin(token, authorId))) { return 401; }

    const responses = await Inbox.updateOne({authorId: authorId},{requests: [], likes: [], posts: [], comments: []}).clone();
    
    if(responses.modifiedCount != 1){
        return 404;
    }

    return 200;
}

async function sendToForeignInbox(url, auth, data){
    let config = {
        url: url + "/inbox",
        method: "post",
        headers:{
            "Authorization": auth,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
    }
    //Send a post request to that node with the proper auth
    //The post should contain the contents of whatever is meant to be 
    let response = "";
    let status;
    await axios.request(config)
    .then((res) => {
        console.log(res.data);
        response = res.data;
        status = 200;
    })
    .catch((err) => {
        console.log(err.response)
        status = err.response.status;
    })

    return [response, status];
}

module.exports = {
    getInbox,
    deleteInbox,
    postInboxPost,
    postInboxLike,
    postInboxComment,
    sendToForeignInbox
}

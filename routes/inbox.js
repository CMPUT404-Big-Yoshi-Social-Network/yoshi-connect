// Database
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

// Schemes
const { Post, Inbox, PostHistory, PublicPost } = require('../scheme/post.js');
const { Like, Comment, CommentHistory, LikeHistory } = require('../scheme/interactions.js');
const { Request, Follower } = require('../scheme/relations.js');
const { Author } = require('../scheme/author.js');
const axios = require('axios');

// UUID
const crypto = require('crypto');

// Other routes functions
const { addLike, addLiked } = require('./likes.js');
const { createComment } = require('./comment.js');
const { validateAuthorObject, getAuthor } = require('./author.js');

// Additional Functions
const { authLogin } = require('./auth.js');
const { OutgoingCredentials } = require('../scheme/server.js');

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

async function getInbox(token, authorId, page, size){
    /**
    Description: Gets an Author's inbox posts
    Associated Endpoint: /authors/:authorId/inbox
                         /authors/:authorId/posts/friends-posts
    Request Type: GET
    Request Body: { authorId: 29c546d45f564a27871838825e3dbecb }
    Return: 400 Status (Bad Request) -- No posts to get
            200 Status (OK) -- Successfully fetches posts from Inbox
                                    { type: "inbox",
                                        author: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb,
                                        items: posts }
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
        console.log(posts[i])
        posts[i] = {
            "type": "post",
            "title": post.title,
            "id": post._id ? post._id : post.id,
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
    let authorPromise = getAuthor(authorId);
    const title = newPost.title;
    const description = newPost.description;
    const contentType = newPost.contentType;
    const content = newPost.content;
    const categories = [''];
    const published = new Date().toISOString();
    const visibility = newPost.visibility;
    const unlisted = newPost.unlisted;

    if(!title || !description || !contentType || !content || !categories){
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
        author: ''
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
    if((visibility !== 'PRIVATE') && (unlisted == "false" || unlisted == false) && (newPost.postTo === '' || newPost.postTo === null || newPost.postTo === undefined)){
        const followers = await Follower.findOne({authorId: authorId}).clone();
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
        for(let i = 0; i < followers.followers.length; i++){
            /*
            post._id = process.env.DOMAIN_NAME + "authors/" + authorId + "/posts/" + post._id;
            const follower = followers.followers[i].authorId;
            const inbox = await Inbox.findOne({authorId: follower}, "_id authorId posts").clone();
            inbox.posts.push(post);
            await inbox.save();
            */
        
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

    if (newPost.postTo !== '' || newPost.postTo !== null || newPost.postTo !== undefined) {
        let objectHost = newPost.postTo.id.split('/authors/')
        let config = {
            host: objectHost[0],
            url: newPost.postTo.id,
            method: "POST",
            headers:{
                "Authorization": auth,
                'Content-Type': 'application/json'
            },
            data: {
                "type": "post",
                "title": post.title,
                "id": post.author.id + '/posts/' + postId,
                "source": post.source,
                "origin": post.origin,
                "description": post.description,
                "contentType": post.contentType,
                "content": post.content,
                "author": post.author, 
                "categories": post.categories,
                "count": 0,
                "comments": post.author.id + '/posts/' + postId + '/comments',
                "commentSrc": {
                    "type": 'comments',
                    "page": 1, 
                    "size": 5,
                    "post": post.author.id + '/posts/' + postId,
                    "id": post.author.id + '/posts/' + postId + '/comments',
                    "comments": []
                },
                "published": post.published,
                "visibility": post.visibility,
                "unlisted": post.unlisted
            }
        }
        await axios.request(config)
        .then((res) => { })
        .catch((err) => { })
    }
    return await getPost(postId, authorId, author);
}

async function postInboxPost(post, recieverAuthorId){
    /**
    Description: Posts a post object into the Author's inbox
    Associated Endpoint: /authors/:authorId/inbox
    Request Type: POST
    Request Body: { authorId: 29c546d45f564a27871838825e3dbecb }
    Return: 401 Status (Unauthorized) -- No token or not authorized
            400 Status (Bad Request) -- No valid type specified in request
            200 Status (OK) -- Successfully posts a post to the Inbox
    */
    if (post.id === undefined) {
        let [newPost, status] = await createPost(null, post.authorId, post.id, {...post});
        post = newPost;
    }
    const type = post.type;
    const title = post.title;
    const id = post.id;
    const source = post.source;
    const origin = post.origin;
    const description = post.description;
    const contentType = post.contentType;
    const content = post.content;
    const published = post.published;
    const visibility = post.visibility;
    if( !type || !title || !id || !source || !origin || !description || !contentType || !content || 
        !published || !visibility)
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
    Description: Posts a like object into the Author's inbox
    Associated Endpoint: /authors/:authorId/inbox
    Request Type: POST
    Request Body: { like: 29c546d45f564a27871838825e3dbecb, author._id: 902sq546w5498hea764r80re0z89bej }
    Return: 400 Status (Bad Request) -- No valid type specified in request
            200 Status (OK) -- Successfully posts a like to the Inbox
    */
    authorId = authorId.split("/");
    authorId = authorId[authorId.length - 1];
    objectHost = like.object.split("/");
    objectHost = objectHost[2];
    let host = process.env.DOMAIN_NAME.split("/");
    host = host[2]
    if (host === objectHost) {
        const inbox = await Inbox.findOne({authorId: authorId}, '_id likes');
        let author = like.author;
        // if(!validateAuthorObject(author)){
        //     return [{}, 400];
        // }
        author = {
            _id: author.id,
            host: author.host,
            displayName: author.displayName,
            url: author.url,
            github: author.github, 
            profileImage: author.profileImage
        };
    
        if(await addLiked(author._id, like.object)){
            return [like, 403];
        }
        await addLike(like, authorId); 
    
        const inboxLike = {
            author: author,
            object: like.object,
            summary: like.summary
        }
    
        inbox.likes.push(inboxLike);
    
        inbox.save();
    } else {
        let obj = (like.object.split('/authors/'))[(like.object.split('/authors/')).length - 1]
        obj = obj.split('/posts/')
        const outgoings = await OutgoingCredentials.find().clone();
        let auth = ''
        for (let i = 0; i < outgoings.length; i++) {
            if (outgoings[i].url === objectHost) {       
                auth = outgoings[i].auth;
            }
        }
        var config = {
            host: objectHost,
            url: objectHost + obj[obj.length - 1] + '/inbox',
            method: 'POST',
            headers: {
                'Authorization': auth,
                'Content-Type': 'application/json'
            },
            data: like
        };

        await axios.request(config)
        .then( res => { })
        .catch( error => { })
    }

    return [like, 200];
}

async function postInboxComment(newComment, recieverAuthorId){
    /**
    Description: Posts a comment object into the Author's inbox
    Associated Endpoint: /authors/:authorId/inbox
    Request Type: POST
    Request Body: { _id: f08d2d6579d5452ab282512d8cdd10d4,
                    author: author,
                    comment: "abc",
                    contentType: text/plain,
                    published: 2023-03-24T06:53:47.567Z }
    Return: 401 Status (Unauthorized) -- No token or not authorized 
            400 Status (Bad Request) -- No valid type specified in request
            500 Status (Internal Server Error) -- Unable to retrieve comment history from database
            200 Status (OK) -- Successfully posts a comment to the Inbox
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

    if(post.visibility === "PUBLIC" && (post.unlisted === "false" || post.unlisted === false)){
        let publicPost = await PublicPost.findOne({_id: postId});
        if(publicPost){
            publicPost.commentCount = post.commentCount;
            await publicPost.save();
        }
    }
    
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

async function postInboxRequest(actor, obj, receiverAuthorId, type) {
    let object = '';
    let resObj = '';
    if (obj !== undefined && obj !== null) {
        object = obj
        resObj = object;
    } else {
        object = await Author.findOne({_id: receiverAuthorId});
        resObj = {
            id: process.env.DOMAIN_NAME + "authors/" + object._id,
            host: process.env.DOMAIN_NAME,
            displayName: object.username,
            url: process.env.DOMAIN_NAME + "authors/" + object._id,
            github: object.github,
            profileImage: object.profileImage 
        }
    }

    let uuid = String(crypto.randomUUID()).replace(/-/g, "");
    let authorId = actor.id;
    authorId = authorId.split("/");
    authorId = authorId[authorId.length - 1];

    let summary = ''
    let request = ''
    if (type !== 'accept') {
        summary = actor.displayName + ' wants to follow ' + resObj.displayName;
        request = {
            _id: uuid,
            goal: type,
            actor: {
                id: actor.id,
                host: actor.host,
                displayName: actor.displayName,
                url: actor.url,
                github: actor.github,
                profileImage: actor.profileImage
            }, 
            object: resObj
        }
    } else {
        summary = actor.displayName + ' accepted ' + object.displayName + ' follow request.';
        request = {
            _id: uuid,
            goal: type,
            actor: {
                id: actor.id,
                host: actor.host,
                displayName: actor.displayName,
                url: actor.url,
                github: actor.github,
                profileImage: actor.profileImage
            }, 
            object: resObj
        }
    }

    const inbox = await Inbox.findOne({authorId: receiverAuthorId});
    inbox.requests.push(request);
    inbox.save();

    const jsonRequest = {
        summary: summary, 
        actor: {
            type: 'author',
            id: actor.id,
            host: actor.host,
            displayName: actor.displayName,
            url: actor.url,
            github: actor.github,
            profileImage: actor.profileImage
        }, 
        object: resObj
    }

    return [jsonRequest, 200];
}

async function deleteInbox(token, authorId){
    /**
    Description: Deletes a request from the inbox
    Associated Endpoint: /authors/:authorId/inbox
    Request Type: DELETE
    Request Body: {  }
    Return: 401 Status (Unauthorized) -- Token has expired or is not authenticated
            404 Status (Not Found) -- No response was found
            200 Status (OK) -- Successfully deleted the request from the Inbox
    */
    if (! (await authLogin(token, authorId))) { return 401; }

    const responses = await Inbox.updateOne({authorId: authorId},{requests: [], likes: [], posts: [], comments: []}).clone();
    
    if(responses.modifiedCount != 1){
        return 404;
    }

    return 200;
}

async function sendToForeignInbox(url, auth, data){
    /** 
    Description: Sends a request to the foreign inbox
    Associated Endpoint: N/A
    Request Type: POST
    Request Body: { url: url + "/inbox",
                    method: "post",
                    headers:{
                        "Authorization": auth,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: data }
    Return: 200 Status (OK) -- Successfully sent the request to the foreign inbox
    */
    let config = {
        url: url + "/inbox",
        method: "POST",
        headers:{
            "Authorization": auth,
            'Content-Type': 'application/json'
        },
        data: data
    }
    //Send a post request to that node with the proper auth
    //The post should contain the contents of whatever is meant to be 
    let response = "";
    let status;
    await axios.request(config)
    .then((res) => {
        response = res.data;
        status = 200;
    })
    .catch((err) => {
        console.log(err)
     })

    return [response, status];
}

module.exports = {
    getInbox,
    deleteInbox,
    postInboxPost,
    postInboxLike,
    postInboxComment,
    postInboxRequest,
    sendToForeignInbox
}
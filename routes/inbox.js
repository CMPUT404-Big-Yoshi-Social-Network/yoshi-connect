// Database
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

// Schemes
const { Post, Inbox, PostHistory } = require('../scheme/post.js');
const { Like, Comment, CommentHistory } = require('../scheme/interactions.js');
const { Request } = require('../scheme/relations.js');
const { Author } = require('../scheme/author.js');

// UUID
const crypto = require('crypto');

// Other routes functions
const { addLike, addLiked } = require('./likes.js');
const { createComment } = require('./comment.js');
const { validateAuthorObject, getAuthor } = require('./author.js');

// Additional Functions
const { authLogin } = require('./auth.js');
const { createPost } = require('./post.js');

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
    let response = {
        type: "inbox",
        author: process.env.DOMAIN_NAME + "authors/" + authorId,
        items: posts
    };

    return [response, 200];
}

async function postInbox(req, res){
    /**
    Description: 
    Associated Endpoint: (for example: /authors/:authorid)
    Request Type: 
    Request Body: (for example: { username: kc, email: 123@aulenrta.ca })
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
    */
    if(req.body.type === "post") {
        const title = req.body.title;
        const id = req.body._id;
        const description = req.body.description;
        const contentType = req.body.contentType;
        const content = req.body.content;
        const categories = req.body.categories;
        const count = req.body.count;
        const comments = req.body.comments;
        const published = req.body.published;
        const visibility = req.body.visibility;
        const unlisted = req.body.unlisted;
        const authorId = req.body.authorId;

        if ( title === undefined || id === undefined || description === undefined || 
            contentType === undefined || content === undefined || categories === undefined || 
            count === undefined || comments === undefined|| published === undefined || visibility === undefined || 
            unlisted === undefined || authorId === undefined ) { 
                return res.sendStatus(400); 
        }

        let uuid = String(crypto.randomUUID()).replace(/-/g, "");
        const post = Post({
                _id: uuid,
                title: title,
                description: description,
                contentType: contentType,
                content: content,
                authorId: authorId,
                categories: categories,
                count: 0,
                likes: [],
                comments: [],
                published: published,
                visibility: visibility,
                specifics: specifics,
                unlisted: unlisted,
                image: ""
        });

        postInboxPost(post, req.params.author_id);

        return res.sendStatus(200);
    } else if(req.body.type === "follow") {
        const senderUUID = await Author.findOne({username: req.body.data.sender});
        const receiverUUID = await Author.findOne({username: req.body.data.receiver});
        let uuidReq = String(crypto.randomUUID()).replace(/-/g, "");
        const request = new Request({
            _id: uuidReq,
            senderId: req.body.sender,
            senderUUID: senderUUID,
            receiverId: req.body.receiver,
            receiverUUID: receiverUUID,
        });

        postInboxRequest(request, req.params.author_id);

        return res.sendStatus(200);
    } else if(req.body.type === "like") {
        
        let uuidLike = String(crypto.randomUUID()).replace(/-/g, "");
        const like = new Like({
            _id: uuidLike,
            liker: req.body.liker
        });

        postInboxLike(like, req.params.author_id);
    } else if (req.body.type === "comment") {
        let uuidCom = String(crypto.randomUUID()).replace(/-/g, "");
        const comment = new Comment({
            _id: uuidCom,
            commenter: req.body.commenter,
            comment: req.body.comment
        });

        postInboxComment(comment, req.params.author_id);
    } else {
        res.sendStatus(400);
    }
}

async function postInboxPost(post, recieverAuthorId){
    /**
    Description: 
    Associated Endpoint: (for example: /authors/:authorid)
    Request Type: 
    Request Body: (for example: { username: kc, email: 123@aulenrta.ca })
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
    */
    const postFrom = post.authorId // Need to discuss wherther other teams will follow this
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
    const categories = post.categories;
    const published = post.published;
    //Used to mark if this is a private message or a follower post.
    const visibility = post.visibility;

    if( !type || !title || !id || !source || !origin || !description || !contentType || !content || !authorType || !authorId ||
        !authorHost || !authorDisplayName || !authorUrl || !categories || 
        !published || !visibility)
    {
        return [{}, 400];
    }

    const inbox = await Inbox.findOne({authorId: recieverAuthorId}, '_id posts');
    
    post._id = id
    inbox.posts.push({...post, postFrom: postFrom});
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
        github: author.github, //TODO I don't think we need this but I'll leave it here for later consideration
        profileImage: author.profileImage
    };

    //Add a like to the authors post/comment
    await addLike(like, authorId);
    await addLiked(author._id, like.object);
    
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

async function postInboxRequest(actor, receiverAuthorId) {
    const object = await Author.findOne({_id: receiverAuthorId});

    let summary = actor.displayName + ' wants to follow ' + object.username;

    let uuid = String(crypto.randomUUID()).replace(/-/g, "");
    let authorId = actor.id;
    authorId = authorId.split("/");
    authorId = authorId[authorId.length - 1];

    const request = {
        _id: uuid,
        actor: actor.displayName,
        actorId: authorId,
        objectId: object._id,
        object: object.username
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
        object: {
            type: 'author',
            id: process.env.DOMAIN_NAME + "authors/" + object._id,
            host: process.env.DOMAIN_NAME,
            displayName: object.username,
            url: process.env.DOMAIN_NAME + "authors/" + object._id,
            github: object.github,
            profileImage: object.profileImage 
        }
    }

    return [jsonRequest, 200];
}

async function deleteInbox(token, authorId){
    /**
    Description: 
    Associated Endpoint: (for example: /authors/:authorid)
    Request Type: 
    Request Body: (for example: { username: kc, email: 123@aulenrta.ca })
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
    */
    if (! (await authLogin(token, authorId))) { return 401; }

    const responses = await Inbox.updateOne({authorId: authorId},{requests: [], likes: [], posts: [], comments: []}).clone();
    
    if(responses.modifiedCount != 1){
        return 404;
    }

    return 200;
}

module.exports = {
    getInbox,
    deleteInbox,
    postInboxPost,
    postInboxLike,
    postInboxComment,
    postInboxRequest
}
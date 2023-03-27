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

// Additional Functions
const { authLogin } = require('./auth.js');

async function getInbox(token, authorId, page, size){
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
    const count = post.count;
    const published = post.published;
    const postTo = post.postTo // Need to discuss wherther other teams will follow this
    //Used to mark if this is a private message or a follower post.
    const visibility = post.visibility;
    const unlisted = post.unlisted;

    if( !type || !title || !id || !source || !origin || !description || !contentType || !content || !authorType || !authorId ||
        !authorHost || !authorDisplayName || !authorUrl || !authorGithub || !authorProfileImage || !categories || !count || 
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

async function deleteInbox(token, authorId){
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
    postInboxComment
}
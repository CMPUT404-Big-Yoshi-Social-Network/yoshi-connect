// Database
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

// Schemes
const { Post, Inbox } = require('../scheme/post.js');
const { Like, Comment } = require('../scheme/interactions.js');
const { Request } = require('../scheme/relations.js');

// UUID
const crypto = require('crypto');

// Other routes functions
const { addLike, addLiked } = require('./likes.js');

// Additional Functions
const { authLogin } = require('./auth.js');

async function createInbox(username, authorId){
    let uuid = String(crypto.randomUUID()).replace(/-/g, "");
    await Inbox({
        _id: uuid,
        authorId: authorId,
        username: username,
        posts: [],
        likes:[],
        comments: [],
        requests: []
    }).save();
}

async function getInbox(token, authorId, page, size){
    if( ! (await authLogin(token, authorId))){
        return [{}, 401];
    }

    if(page == undefined) { page = 1; }
    if(size == undefined) { size = 5; }

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

    return [posts[0].posts_array, 200];
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

    inbox.posts.push(post);
    await inbox.save();

    return [post, 200]
}

async function postInboxRequest(request, authorId){
    const inbox = await Inbox.findOne({authorId: authorId}, '_id requests');

    inbox.requests.push(request);
    inbox.save();
}

async function postInboxLike(like, authorId){
    const inbox = await Inbox.findOne({authorId: authorId}, '_id likes');
    let author = like.author;

    author = {
        _id: author.id,
        host: author.host,
        displayName: author.displayName,
        url: author.url,
        github: author.github, //TODO I don't think we need this but I'll leave it here for later consideration
        profileImage: author.profileImage
    };

    //Add a like to the authors post/comment
    await addLike(like, author);
    await addLiked(author._id, like.object);

    //TODO Unliking should also be added

    const inboxLike = {
        author: author,
        object: like.object,
        summary: like.summary
    }

    inbox.likes.push(inboxLike);

    inbox.save();
}

async function postInboxComment(authorId, newComment){
    newComment.object;
    createComment(undefined, authorId, newComment.object, newComment)
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
    createInbox,
    getInbox,
    deleteInbox,
    postInboxPost,
    postInboxLike,
    postInboxComment,
    postInboxRequest,
}
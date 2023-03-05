// Database
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

// Schemas
const { PostHistory, Post} = require('../db_schema/post_schema.js');
const { Comment, Comments, Like, Likes } = require('../db_schema/interactionSchema.js');
const { Friend } = require('../db_schema/author_schema.js');

async function createPostHistory(authorId){
    console.log('Debug: Creating post history for user')
    let newPostHistory = new PostHistory ({
        authorId: authorId,
        num_posts: 0,
        posts: []
    })
    await newPostHistory.save()
    return;
}

async function addLike(req, res){
    console.log('Debug: Adding a like')

    const liker = await Author.findOne({_id: req.body.data.authorId});
    const postHistory = await PostHistory.findOne({authorId: req.body.data.authorId});
    let success = false;

    var like = new Like({
        '@context': '', // TODO: UNDERSTAND THIS CONTEXT
        summary: liker.displayName + 'Likes your post',
        type: 'Like',
        author: liker,
        object: req.body.data.postId
    });

    let idx = postHistory.posts.map(obj => obj._id).indexOf(req.body.data.postId);
    if (idx > -1) { 
        postHistory.posts[idx].likesSrc.items.push(like);
        success = true;
    } else {
        console.log('Debug: No such post exists!')
    }

    return res.json({ status: success })
}

async function deleteLike(req, res){
    console.log('Debug: Removing a like')

    let updatedPosts = [];
    let success = false;
    
    await PostHistory.findOne({authorId: req.body.authorId}, function(err, history){
        console.log('Debug: Find the post with the like.')
        if (history) {
            let postIdx = history.posts.map(obj => obj._id).indexOf(req.body.postId);
            if (postIdx > -1) { 
                let like_idx = history.posts[postIdx].likesSrc.items.map(obj => obj._id).indexOf(req.body.likeId);
                history.posts[postIdx].likesSrc.items[like_idx].splice(like_idx, 1);
                updatedPosts = history.posts;
                success = true;
            }
        }
    }).clone()
    await PostHistory.findOneAndReplace({authorId: req.body.authorId}, {authorId: req.body.receiver, num_posts: req.body.data.numPosts, posts: updatedPosts}).clone()

    return res.json({ status: success })
}

async function addComment(req, res){
    console.log('Debug: Adding a comment')

    const commenter = await Author.findOne({_id: req.body.data.commenter});
    const postHistory = await PostHistory.findOne({authorId: req.body.data.authorId});
    
    let success = false;

    var comment = new Comment({
        type: 'comment',
        author: commenter,
        comment: req.body.data.comment,
        contentType: '', // TODO: GET CONTENT TYPE
        published: '' // TODO: GET PUBLISHED 
    });

    let idx = postHistory.posts.map(obj => obj._id).indexOf(req.body.data.postId);
    if (idx > -1) { 
        postHistory.posts[idx].commentsSrc.comments.push(comment);
        success = true;
    } else {
        console.log('Debug: No such post exists!')
    }

    return res.json({ status: success })
}

async function deleteComment(req, res){
    console.log('Debug: Deleting a comment')
    let updatedPosts = [];
    let success = false;
    await PostHistory.findOne({authorId: req.body.data.authorId}, function(err, history){
        console.log('Debug: Find the post with the comment.')
        if (history) {
            let postIdx = history.posts.map(obj => obj._id).indexOf(req.body.data.postId);
            if (postIdx > -1) { 
                let com_idx = history.posts[postIdx].commentsSrc.comments.map(obj => obj._id).indexOf(req.body.data.commentId);
                history.posts[postIdx].commentsSrc.comments[com_idx].splice(com_idx, 1);
                updatedPosts = history.posts;
                success = true;
            }
        }
    }).clone()
    await PostHistory.findOneAndReplace({authorId: req.body.data.authorId}, {authorId: req.body.data.receiver, num_posts: req.body.data.numPosts, posts: updatedPosts}).clone()

    return res.json({ status: success })
}

async function editComment(req, res){
    console.log('Debug: Editing a comment')
    let updatedPosts = [];
    let success = false;
    await PostHistory.findOne({authorId: req.body.data.authorId}, function(err, history){
        console.log('Debug: Find the post with the comment.')
        if (history) {
            let postIdx = history.posts.map(obj => obj._id).indexOf(req.body.data.postId);
            if (postIdx > -1) { 
                let com_idx = history.posts[postIdx].commentsSrc.comments.map(obj => obj._id).indexOf(req.body.data.commentId);
                history.posts[postIdx].commentsSrc.comments[com_idx].comment = req.body.data.comment;
                updatedPosts = history.posts;
                success = true;
            }
        }
    }).clone()
    await PostHistory.findOneAndReplace({authorId: req.body.data.authorId}, {authorId: req.body.data.receiver, num_posts: req.body.data.numPosts, posts: updatedPosts}).clone()

    return res.json({ status: success })
}

async function createPost(req, res, postId){
    console.log('Debug: Creating a post')

    // Post Attributes
    const title = req.body.data.title;
    const source = req.body.data.source
    const origin = req.body.data.origin
    const desc = req.body.data.desc;
    const contentType = req.body.data.contentType;
    const content = req.body.data.content;
    const categories = req.body.data.categories
    const published = new Date().toISOString();
    const visibility = req.body.data.visibility;
    const unlisted = !req.body.data.listed;
    const specifics = req.body.data.specifics;
    const image = req.body.data.image;
    const author = await Author.findOne({_id: req.params.authorId});

    //Get the author's document
    //Should be refactored to do use an aggregate pipeline in case of large number of posts 
    let postHistory = await PostHistory.findOne({authorId: authorId});

    if (postHistory == null) {
        console.log('Debug: Create a post history');
        await createPostHistory(req.params.authorId);
    }

    if (postId == undefined) {
        const new_post = new Post({
            type: 'post',
            title: title,
            description: desc,
            source: source,
            origin: origin,
            contentType: contentType,
            content: content,
            author: author,
            categories: categories,
            count: 0,
            commentsSrc: null, // TODO: IS THIS VALID?
            comments: '', // "http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/de305d54-75b4-431b-adb2-eb6b9e546013/comments"
            published: published,
            visibility: visibility,
            unlisted: unlisted,
            likesSrc: null, // TODO: IS THIS VALID?
            specifics: specifics,
            image: image
        });
    
        const commentsSrc = new Comments({
            type: 'comments',
            page: 0,
            size: 0,
            post: post._id, // "http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/764efa883dda1e11db47671c4a3bbd9e"
            comments: []
        });
        new_post.commentsSrc = commentsSrc;
        new_post.comments = commentsSrc._id;
    
        const likesSrc = new Likes({
            type: 'liked',
            items: []
        });
        new_post.likesSrc = likesSrc;
    } else {
        const newPost = new Post({
            type: 'post',
            _id: postId, // "http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/764efa883dda1e11db47671c4a3bbd9e"
            title: title,
            description: desc,
            source: source,
            origin: origin,
            contentType: contentType,
            content: content,
            author: author,
            categories: categories,
            count: 0,
            commentsSrc: null, // TODO: ?
            comments: '', // "http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/de305d54-75b4-431b-adb2-eb6b9e546013/comments"
            published: published,
            visibility: visibility,
            unlisted: unlisted,
            likesSrc: null,
            specifics: specifics,
            image: image
        });
    
        const commentsSrc = new Comments({
            type: 'comments',
            page: 0,
            size: 0,
            post: post._id, // "http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/764efa883dda1e11db47671c4a3bbd9e"
            comments: []
        });
        newPost.commentsSrc = commentsSrc;
        newPost.comments = commentsSrc._id;
    
        const likesSrc = new Likes({
            type: 'liked',
            items: []
        });
        newPost.likesSrc = likesSrc;
    }

    postHistory = await PostHistory.findOne({authorId: authorId});
    postHistory.posts.push(post);
    postHistory.numPosts = postHistory.numPosts + 1;
    await postHistory.save();
}

async function getPost(req, res){
    console.log("Debug: Getting a post");

    const authorId = req.params.authorId;
    const postId = req.params.postId;

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
    return res.json(post);
}

async function getPostsPaginated(req, res){
    console.log('Debug: Paging the posts')

    const authorId = req.params.authorId;

    let page = null;
    let size = null;
    if(req.query.page != undefined) { page = req.query.page; }
    if(req.query.size != undefined) { size = req.query.size; }

    const startIndex = (page - 1) * size; 
    const endIndex = page * size;

    /*
    let posts = await PostHistory.aggregate([
        {
            $match: {'authorId': authorId}
        },
        {
            $slice: ["$posts", 1]
        }
    ])
    */

    let posts = await PostHistory.aggregate([
        {
            $match: {'authorId': authorId}
        },
        {
            $project: {_id: 1, posts: {$slice: ["$posts", startIndex, endIndex]}}
        },
        {
            $unwind: "$posts"
        }
    ])

    return res.sendStatus(200);
}

async function updatePost(req, res){
    console.log("Debug: Update a post");

    const authorId = req.params.authorId;
    const postId = req.params.postId;

    // Editable post attributes
    const title = req.body.title;
    const desc = req.body.desc;
    const contentType = req.body.contentType;
    const content = req.body.content;
    const categories = req.body.categories;
    const visibility = req.body.visibility;
    const unlisted = req.body.listed;
    const specifics = req.body.specifics;
    const image = req.body.image;

    const postHistory = await PostHistory.findOne({authorId: authorId});

    const post = postHistory.posts.id(postId)

    let specificsUpdated = false;
    post.title = title; 
    post.description = desc;
    post.contentType = contentType;
    post.content = content;
    if ( post.visibility != visibility ) {
        if ( (visibility == 'Friends' || visibility == 'Public') && post.specifics.length != 0) {
            console.log('Debug: The user turned their private post to specific users to a public / friends viewable post.')
            post.specifics = [];
            specificsUpdated = true;
        } 
        post.visibility = visibility;
    }
    if ( !specificsUpdated ) {
        if ( post.specifics != specifics ) {
            post.specifics = specifics;
        }
    }
    post.categories = categories;
    post.unlisted = unlisted;
    post.image = image;

    await postHistory.save()
    console.log("Debug: Post has been updated and saved.");

    return res.sendStatus(200);
}

async function deletePost(req, res){
    console.log("Debug: Delete a post");

    const authorId = req.params.authorId;
    const postId = req.params.postId;

    const postHistory = await PostHistory.findOne({authorId: authorId});
    if(postHistory == undefined) { return sendStatus(500); }
    const post = await postHistory.posts.id(postId);
    if(post == null) { return res.sendStatus(404); }

    post.remove();
    postHistory.numPosts = postHistory.numPosts - 1;
    postHistory.save();

    return res.sendStatus(200);
}

async function checkVisibility(req, res){
    console.log('Debug: Checks the visibility of the post for the viewer');
    const authorId = req.params.authorId;
    const viewerId = req.body.data.viewerId;
    const postId = req.params.postId;

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
            if (friend) { friends = friend.items; }
        }).clone()

        for ( let i = 0; i < friends.length ; i++ ) {
            if ( viewerId == friends[i]._id ) {
                viewable = true;
                break;
            }
        }

        if ( !viewable ) { return res.sendStatus(404); } 
    } else if ( post.visibility == 'Private' ) {
        console.log('Debug: Only specific people can see this post (i.e., messages).')
        for ( let i = 0; i < post.specifics.length ; i++ ) {
            if ( viewerId == post.specifics[i]._id ) {
                viewable = true;
                break;
            }
        }
        if ( !viewable ) { return res.sendStatus(404); }
    }
    
    return res.json({ viewable: viewable })
}


module.exports={
    createPostHistory,
    createPost,
    getPost,
    getPostsPaginated,
    updatePost,
    deletePost,
    addLike,
    addComment,
    deleteLike,
    deleteComment,
    editComment,
    checkVisibility
}
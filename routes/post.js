const { Post_History, Post, Like, Comment } = require('../db_schema/post_schema.js');
const { Comment, Comments, Like, Likes } = require('../db_schema/comment_like_schema');
const { Friend } = require('../db_schema/author_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

async function create_post_history(author_id){
    console.log('Debug: Creating post history for user')
    let new_post_history = new Post_History ({
        authorId: author_id,
        num_posts: 0,
        posts: []
    })
    await new_post_history.save()
    return;
}

async function addLike(req, res){
    console.log('Debug: Adding a like')

    const postHistory = await Post_History.findOne({authorId: req.body.data.authorId});
    const liker = await Author.findOne({_id: req.body.data.authorId});

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

    let updated_posts = [];
    let success = false;

    await Post_History.findOne({authorId: req.body.authorId}, function(err, history){
        console.log('Debug: Find the post with the like.')
        if (history) {
            let post_idx = history.posts.map(obj => obj._id).indexOf(req.body.postId);
            if (post_idx > -1) { 
                let like_idx = history.posts[post_idx].likesSrc.items.map(obj => obj._id).indexOf(req.body.likeId);
                history.posts[post_idx].likesSrc.items[like_idx].splice(like_idx, 1);
                updated_posts = history.posts;
                success = true;
            }
        }
    }).clone()
    await Post_History.findOneAndReplace({authorId: req.body.authorId}, {authorId: req.body.receiver, num_posts: req.body.data.numPosts, posts: updated_posts}).clone()

    return res.json({ status: success })
}

async function addComment(req, res){
    console.log('Debug: Adding a comment')

    const postHistory = await Post_History.findOne({authorId: req.body.data.authorId});
    const commenter = await Author.findOne({_id: req.body.data.commenter});

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
    let updated_posts = [];
    let success = false;
    await Post_History.findOne({authorId: req.body.data.authorId}, function(err, history){
        console.log('Debug: Find the post with the comment.')
        if (history) {
            let post_idx = history.posts.map(obj => obj._id).indexOf(req.body.data.postId);
            if (post_idx > -1) { 
                let com_idx = history.posts[post_idx].commentsSrc.comments.map(obj => obj._id).indexOf(req.body.data.commentId);
                history.posts[post_idx].commentsSrc.comments[com_idx].splice(com_idx, 1);
                updated_posts = history.posts;
                success = true;
            }
        }
    }).clone()
    await Post_History.findOneAndReplace({authorId: req.body.data.authorId}, {authorId: req.body.data.receiver, num_posts: req.body.data.numPosts, posts: updated_posts}).clone()

    return res.json({ status: success })
}

async function editComment(req, res){
    console.log('Debug: Editing a comment')
    let updated_posts = [];
    let success = false;
    await Post_History.findOne({authorId: req.body.data.authorId}, function(err, history){
        console.log('Debug: Find the post with the comment.')
        if (history) {
            let post_idx = history.posts.map(obj => obj._id).indexOf(req.body.data.postId);
            if (post_idx > -1) { 
                let com_idx = history.posts[post_idx].commentsSrc.comments.map(obj => obj._id).indexOf(req.body.data.commentId);
                history.posts[post_idx].commentsSrc.comments[com_idx].comment = req.body.data.comment;
                updated_posts = history.posts;
                success = true;
            }
        }
    }).clone()
    await Post_History.findOneAndReplace({authorId: req.body.data.authorId}, {authorId: req.body.data.receiver, num_posts: req.body.data.numPosts, posts: updated_posts}).clone()

    return res.json({ status: success })
}

async function create_post(req, res, postId){
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
    const author = await Author.findOne({_id: req.params.author_id});

    //Get the author's document
    //Should be refactored to do use an aggregate pipeline in case of large number of posts
    let post_history = await Post_History.findOne({authorId: req.params.author_id});

    if (post_history == null) {
        console.log('Debug: Create a post history');
        await create_post_history(req.params.author_id);
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
        new_post.commentsSrc = commentsSrc;
        new_post.comments = commentsSrc._id;
    
        const likesSrc = new Likes({
            type: 'liked',
            items: []
        });
        new_post.likesSrc = likesSrc;
    } else {
        const new_post = new Post({
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
        new_post.commentsSrc = commentsSrc;
        new_post.comments = commentsSrc._id;
    
        const likesSrc = new Likes({
            type: 'liked',
            items: []
        });
        new_post.likesSrc = likesSrc;
    }

    post_history = await Post_History.findOne({authorId: req.params.author_id});
    post_history.posts.push(new_post);
    post_history.num_posts = post_history.num_posts + 1;
    await post_history.save();
}

async function get_post(req, res){
    console.log("Debug: Getting a post");

    const authorId = req.params.author_id;
    const postId = req.params.post_id;

    let post = await Post_History.aggregate([
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

async function get_posts_paginated(req, res){
    console.log('Debug: Paging the posts')

    const authorId = req.params.author_id;

    let page = null;
    let size = null;
    if(req.query.page != undefined) { page = req.query.page; }
    if(req.query.size != undefined) { size = req.query.size; }

    const start_index = (page - 1) * size; 
    const end_index = page * size;

    /*
    let posts = await Post_History.aggregate([
        {
            $match: {'authorId': authorId}
        },
        {
            $slice: ["$posts", 1]
        }
    ])
    */

    let posts = await Post_History.aggregate([
        {
            $match: {'authorId': authorId}
        },
        {
            $project: {_id: 1, posts: {$slice: ["$posts", start_index, end_index]}}
        },
        {
            $unwind: "$posts"
        }
    ])

    return res.sendStatus(200);
}

async function update_post(req, res){
    console.log("Debug: Update a post");

    const authorId = req.params.author_id;
    const postId = req.params.post_id;

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

    const post_history = await Post_History.findOne({authorId: authorId});
    const post = post_history.posts.id(postId)

    let specifics_updated = false;
    post.title = title; 
    post.description = desc;
    post.contentType = contentType;
    post.content = content;
    if ( post.visibility != visibility ) {
        if ( (visibility == 'Friends' || visibility == 'Public') && post.specifics.length != 0) {
            console.log('Debug: The user turned their private post to specific users to a public / friends viewable post.')
            post.specifics = [];
            specifics_updated = true;
        } 
        post.visibility = visibility;
    }
    if ( !specifics_updated ) {
        if ( post.specifics != specifics ) {
            post.specifics = specifics;
        }
    }
    post.categories = categories;
    post.unlisted = unlisted;
    post.image = image;

    await post_history.save()
    console.log("Debug: Post has been updated and saved.");

    return res.sendStatus(200);
}

async function delete_post(req, res){
    console.log("Debug: Delete a post");

    const authorId = req.params.author_id;
    const postId = req.params.post_id;

    const post_history = await Post_History.findOne({authorId: authorId});
    const post = post_history.posts.id(postId);
    if(post_history == undefined) { return sendStatus(500); }
    if(post == null) { return res.sendStatus(404); }

    post.remove();
    post_history.num_posts = post_history.num_posts - 1;
    post_history.save();

    return res.sendStatus(200);
}

async function checkVisibility(req, res){
    console.log('Debug: Checks the visibility of the post for the viewer');
    const authorId = req.params.author_id;
    const viewerId = req.body.data.viewerId;
    const postId = req.params.post_id;

    let post = await Post_History.aggregate([
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
    create_post_history,
    create_post,
    get_post,
    get_posts_paginated,
    update_post,
    delete_post,
    addLike,
    addComment,
    deleteLike,
    deleteComment,
    editComment,
    checkVisibility
}
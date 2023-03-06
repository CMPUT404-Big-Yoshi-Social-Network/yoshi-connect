const { PostHistory, Post, Like, Comment, PublicPost } = require('../db_schema/post_schema.js');
const { Friend, Author } = require('../db_schema/author_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

async function create_post_history(author_id){
    console.log('Debug: Creating post history for user')
    let new_post_history = new PostHistory ({
        authorId: author_id,
        num_posts: 0,
        posts: []
    })

    await new_post_history.save()

    return;
}

async function addLike(req, res){
    console.log('Debug: Adding a like')
    const postHistory = await PostHistory.findOne({authorId: req.body.data.authorId});
    let publicPost = await PublicPost.find();
    let success = false;
    let numLikes = 0;

    var like = new Like({
        liker: req.body.data.liker
    });

    let idx = postHistory.posts.map(obj => obj._id).indexOf(req.body.data.postId);
    if (idx > -1) { 
        let likerIdx = postHistory.posts[idx].likes.map(obj => obj.liker).indexOf(like.liker);
        if (likerIdx <= -1) {
            console.log('Debug: Adding that like!')
            postHistory.posts[idx].likes.push(like);
            numLikes = postHistory.posts[idx].likes.length;
            await postHistory.save();
            success = true;

            for (let i = 0; i < publicPost[0].posts.length; i++) {
                if (publicPost[0].posts[i].post._id === req.body.data.postId) {
                    publicPost[0].posts[i].post.likes.push(like);
                    numLikes = publicPost[0].posts[i].post.likes.length;
                    await publicPost[0].save();
                }
            }
        }
    } else {
        console.log('Debug: No such post exists!')
    }

    return res.json({ status: success, numLikes: numLikes })
}

async function deleteLike(req, res){
    console.log('Debug: Removing a like')
    let success = false;
    let numLikes = 0;
    let publicPost = await PublicPost.find();
    await PostHistory.findOne({authorId: req.body.authorId}, async function(err, history){
        console.log('Debug: Find the post with the like.')
        if (history) {
            let post_idx = history.posts.map(obj => obj._id).indexOf(req.body.postId);
            if (post_idx > -1) { 
                let like_idx = history.posts[post_idx].likes.map(obj => obj._id).indexOf(req.body.likeId);
                history.posts[post_idx].likes.splice(like_idx, 1);
                await history.save();
                success = true;

                for (let i = 0; i < publicPost[0].posts.length; i++) {
                    if (publicPost[0].posts[i].post._id === req.body.data.postId) {
                        let like_idx = publicPost[0].posts[i].likes.map(obj => obj._id).indexOf(req.body.likeId);
                        publicPost[0].posts[i].likes.splice(like_idx, 1);
                        numLikes = publicPost[0].posts[i].likes.length;
                        await publicPost[0].save();
                    }
                }
            }
        }
    }).clone()
 
    return res.json({
        status: success,
        numLikes: numLikes
    })
}

async function addComment(req, res){
    console.log('Debug: Adding a comment')
    const postHistory = await PostHistory.findOne({authorId: req.body.authorId});
    let publicPost = await PublicPost.find();
    let success = false;

    var comment = new Comment({
        commenter: req.body.commenter,
        comment: req.body.content
    });

    let idx = postHistory.posts.map(obj => obj._id).indexOf(req.body.postId);
    if (idx > -1) { 
        postHistory.posts[idx].comments.push(comment);
        postHistory.posts[idx].count + 1;
        postHistory.save();
        success = true;

        for (let i = 0; i < publicPost[0].posts.length; i++) {
            if (publicPost[0].posts[i].post._id === req.body.postId) {
                publicPost[0].posts[i].post.count + 1;
                publicPost[0].posts[i].post.comments.push(comment);
                await publicPost[0].save();
            }
        }
    } else {
        console.log('Debug: No such post exists!')
    }

    return res.json({ status: success, numComments: postHistory.posts[idx].count })
}

async function deleteComment(req, res){
    console.log('Debug: Deleting a comment')
    let success = false;
    let numComments = 0;
    let publicPost = await PublicPost.find();
    await PostHistory.findOne({authorId: req.body.authorId}, async function(err, history){
        console.log('Debug: Find the post with the comment.')
        if (history) {
            let post_idx = history.posts.map(obj => obj._id).indexOf(req.body.postId);
            if (post_idx > -1) { 
                console.log('Debug: Found comment')
                let com_idx = history.posts[post_idx].comments.map(obj => obj._id).indexOf(req.body.commentId);
                history.posts[post_idx].comments.splice(com_idx, 1);
                history.posts[idx].count - 1;
                numComments = history.posts[idx].count;
                success = true;
                await history.save();

                for (let i = 0; i < publicPost[0].posts.length; i++) {
                    if (publicPost[0].posts[i].post._id === req.body.data.postId) {
                        let com_idx = publicPost[0].posts[i].comments.map(obj => obj._id).indexOf(req.body.commentId);
                        publicPost[0].posts[i].comments.splice(com_idx, 1);
                        publicPost[0].posts[i].count - 1;
                        numComments = publicPost[0].posts[i].count;
                        await publicPost[0].save();
                    }
                }
            }
        }
    }).clone()
    
    return res.json({
        status: success,
        numComments: numComments
    })
}

async function editComment(req, res){
    console.log('Debug: Editing a comment')
    let success = false;
    await PostHistory.findOne({authorId: req.body.data.authorId}, function(err, history){
        console.log('Debug: Find the post with the comment.')
        if (history) {
            let post_idx = history.posts.map(obj => obj._id).indexOf(req.body.data.postId);
            if (post_idx > -1) { 
                console.log('Debug: Found the comment')
                let com_idx = history.posts[post_idx].comments.map(obj => obj._id).indexOf(req.body.data.commentId);
                history.posts[post_idx].comments[com_idx].comment = req.body.data.comment;
                history.save();
                success = true;
            }
        }
    }).clone()
    
    return res.json({ status: success })
}

async function create_post(req, res, postId){
    console.log('Debug: Creating a post')
    let authorId = req.params.author_id;
    //Setup the rest of the post
    const title = req.body.data.title;
    const desc = req.body.data.desc;
    const contentType = req.body.data.contentType;
    const content = req.body.data.content;
    const categories = [""];
    const published = new Date().toISOString();
    const visibility = req.body.data.visibility;
    const unlisted = req.body.data.unlisted;
    const specifics = req.body.data.specifics;
    const image = req.body.data.image;

    //Get the author's document
    //Should be refactored to do use an aggregate pipeline in case of large number of posts
    let post_history = await PostHistory.findOne({authorId: authorId});

    if (post_history == null) {
        console.log('Debug: Create a post history');
        await create_post_history(authorId);
    }

    if(postId == undefined){

        var post = new Post({
            title: title,
            description: desc,
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
            image: image
        });
    }
    else{
        var post = new Post({
            _id: postId,
            title: title,
            description: desc,
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
            image: image
        });
    }

    post_history = await PostHistory.findOne({authorId: authorId});
    post_history.posts.push(post);
    post_history.num_posts = post_history.num_posts + 1;
    await post_history.save();

    if (visibility === 'Public') {
        let publicPost = await PublicPost.find();
        publicPost[0].posts.push({authorId: authorId, post: post});
        publicPost[0].num_posts = publicPost[0].num_posts + 1;
        await publicPost[0].save();
    }
}

async function get_post(req, res){
    console.log("Debug: Getting a post");

    const authorId = req.params.author_id;
    const postId = req.params.post_id;

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
    if(post.length == 0)
        return res.sendStatus(404);
    return res.json(post);
}

async function get_posts_paginated(req, res){
    console.log('Debug: Paging the posts')
    const authorId = req.params.author_id;

    console.log(req.query.page);
    console.log(req.query.size);

    let page = 1;
    let size = 5;
    if(req.query.page != undefined)
        page = req.query.page;
    if(req.query.size != undefined)
        size = req.query.size;

    const start_index = (page - 1) * size; 
    const end_index = page * size;
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
    const postId = req.body.data.postId;

    const title = req.body.data.title;
    const desc = req.body.data.desc;
    const contentType = req.body.data.contentType;
    const content = req.body.data.content;
    const categories = req.body.data.categories;
    const visibility = req.body.data.visibility;
    const unlisted = req.body.data.listed;
    const specifics = req.body.data.specifics;
    const image = req.body.data.image;

    const post_history = await PostHistory.findOne({authorId: authorId});
    const publicPost = await PublicPost.find();

    let post = null;
    let postIdx = post_history.posts.map(obj => obj._id).indexOf(postId);
    if (postIdx > -1) { 
        post = post_history.posts[postIdx]
    }

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
        } else if (visibility == 'Public' && post.visibility != 'Public') {
            publicPost[0].posts.push({authorId: authorId, post: post});
            publicPost[0].num_posts = publicPost[0].num_posts + 1;
            await publicPost[0].save();
        } else if (post.visibility == 'Public' && visibility != 'Public') {
            let idx = publicPost[0].posts.map(obj => obj.post._id).indexOf(postId);
            if (idx > -1) { 
                publicPost[0].posts.splice(idx, 1);
                publicPost[0].num_posts = publicPost[0].num_posts - 1;
                await publicPost[0].save();
            }
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

    for (let i = 0; i < publicPost[0].posts.length; i++) {
        if (publicPost[0].posts[i].post._id === postId) {
            publicPost[0].posts[i].post = post;
            await publicPost[0].save();
        }
    }

    await post_history.save()
    console.log("Debug: Post has been updated and saved.");

    return res.sendStatus(200);
}

async function delete_post(req, res){
    console.log("Debug: Delete a post");

    const authorId = req.params.author_id;
    const postId = req.params.post_id;

    const post_history = await PostHistory.findOne({authorId: authorId});

    if(post_history == undefined)
        return sendStatus(500);

    const post = post_history.posts.id(postId);
    if(post == null)
        return res.sendStatus(404);

    if (post.visibility == 'Public') {
        const publicPost = await PublicPost.find();
        let idx = publicPost[0].posts.map(obj => obj.post._id).indexOf(postId);
        if (idx > -1) { 
            publicPost[0].posts.splice(idx, 1);
            publicPost[0].num_posts = publicPost[0].num_posts - 1;
            await publicPost[0].save();
        }
    }

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
            if (friend) {
                friends = friend.friends;
            }
        }).clone()

        for ( let i = 0; i < friends.length ; i++ ) {
            if ( viewerId == friends[i].authorId ) {
                viewable = true;
                break;
            }
        }

        if ( !viewable ) {
            return res.sendStatus(404);
        } 
    } else if ( post.visibility == 'Private' ) {
        console.log('Debug: Only specific people can see this post (i.e., messages).')
        for ( let i = 0; i < post.specifics.length ; i++ ) {
            if ( viewerId == post.specifics[i].authorId ) {
                viewable = true;
                break;
            }
        }
        if ( !viewable ) {
            return res.sendStatus(404);
        }
    }

    return res.json({
        viewable: viewable
    })

}

async function fetchLikers(req, res) {
    console.log('Debug: Getting the likers for a specific post.');

    const authorId = req.body.data.authorId;
    const postId = req.body.data.postId;

    const post = await PostHistory.aggregate([
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
    
    return post[0].posts.likes
}

async function hasLiked(req, res) {
    const likers = await fetchLikers(req, res);
    for (let i = 0; i < likers.length; i++) {
        if (likers[i].liker === req.body.data.viewerId) {
            return res.json({
                status: 'liked'
            })
        }
    }
    return res.json({
        status: 'unliked'
    })
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
    checkVisibility,
    hasLiked
}
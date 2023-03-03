const { author_scheme, login_scheme } = require('../db_schema/author_schema.js');
const { post_history_scheme, post_scheme, like_scheme, comment_scheme } = require('../db_schema/post_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;

const Login = database.model('Login', login_scheme);
const Post_History = database.model('Posts', post_history_scheme);
const Post = database.model('Post', post_scheme);
const Like = database.model('Like', like_scheme);
const Comment = database.model('Comment', comment_scheme);

async function create_post_history(author_id){
    let new_post_history = new Post_History ({
        authorId: author_id,
        num_posts: 0,
        posts: []
    })

    await new_post_history.save()

    return;
}

async function addLike(req, res){
    console.log('Debug: Adding a like!')
    const postHistory = await Post_History.findOne({authorId: req.body.data.authorId});
    let success = false;

    var like = new Like({
        liker: req.body.data.liker
    });

    let idx = postHistory.posts.map(obj => obj._id).indexOf(req.body.data.postId);
    if (idx > -1) { 
        postHistory.posts[idx].likes.push(like);
        postHistory.posts[idx].count++;
        success = true;
    } else {
        console.log('Debug: No such post exists!')
    }

    return json({
        status: success,
        likeId: like._id,
        liker: like.liker,
        postId: postHistory.posts[idx]._id,
        authorId: req.body.data.authorId
    })
}

async function deleteLike(req, res){
    console.log('Debug: Removing a like!')
    let updated_posts = [];
    let success = false;
    await Post_History.findOne({authorId: req.body.data.authorId}, function(err, history){
        console.log('Debug: Find the post with the like.')
        if (history) {
            let post_idx = history.posts.map(obj => obj._id).indexOf(req.body.data.postId);
            if (post_idx > -1) { 
                let like_idx = history.posts[post_idx].likes.map(obj => obj._id).indexOf(req.body.data.likeId);
                history.posts[post_idx].likes[like_idx].splice(like_idx, 1);
                updated_posts = history.posts;
                postHistory.posts[post_idx].count--;
                success = true;
            }
        }
    }).clone()
    await Post_History.findOneAndReplace({authorId: req.body.data.authorId}, {authorId: req.body.data.receiver, num_posts: req.body.data.numPosts, posts: updated_posts}).clone()

    return json({
        status: success,
    })
}

async function addComment(req, res){
    console.log('Debug: Adding a comment!')
    const postHistory = await Post_History.findOne({authorId: req.body.data.authorId});
    let success = false;

    var comment = new Comment({
        commenter: req.body.data.commenter,
        comment: req.body.data.comment
    });

    let idx = postHistory.posts.map(obj => obj._id).indexOf(req.body.data.postId);
    if (idx > -1) { 
        postHistory.posts[idx].comments.push(comment);
        success = true;
    } else {
        console.log('Debug: No such post exists!')
    }

    return json({
        status: success,
        commentId: comment._id,
        commenter: comment.commenter,
        postId: postHistory.posts[idx]._id,
        authorId: req.body.data.authorId
    })
}

async function deleteComment(req, res){
    console.log('Debug: Deleting a comment!')
    let updated_posts = [];
    let success = false;
    await Post_History.findOne({authorId: req.body.data.authorId}, function(err, history){
        console.log('Debug: Find the post with the comment.')
        if (history) {
            let post_idx = history.posts.map(obj => obj._id).indexOf(req.body.data.postId);
            if (post_idx > -1) { 
                let com_idx = history.posts[post_idx].comments.map(obj => obj._id).indexOf(req.body.data.commentId);
                history.posts[post_idx].comments[com_idx].splice(com_idx, 1);
                updated_posts = history.posts;
                success = true;
            }
        }
    }).clone()
    await Post_History.findOneAndReplace({authorId: req.body.data.authorId}, {authorId: req.body.data.receiver, num_posts: req.body.data.numPosts, posts: updated_posts}).clone()

    return json({
        status: success,
    })
}

async function editComment(req, res){
    console.log('Debug: Editing a comment!')
    let updated_posts = [];
    let success = false;
    await Post_History.findOne({authorId: req.body.data.authorId}, function(err, history){
        console.log('Debug: Find the post with the comment.')
        if (history) {
            let post_idx = history.posts.map(obj => obj._id).indexOf(req.body.data.postId);
            if (post_idx > -1) { 
                let com_idx = history.posts[post_idx].comments.map(obj => obj._id).indexOf(req.body.data.commentId);
                history.posts[post_idx].comments[com_idx].comment = req.body.data.comment;
                updated_posts = history.posts;
                success = true;
            }
        }
    }).clone()
    await Post_History.findOneAndReplace({authorId: req.body.data.authorId}, {authorId: req.body.data.receiver, num_posts: req.body.data.numPosts, posts: updated_posts}).clone()

    return json({
        status: success,
    })
}

async function create_post(req, res, postId){
    let authorId = req.params.author_id;
    //Setup the rest of the post
    const title = req.body.data.title;
    const desc = req.body.data.desc;
    const contentType = req.body.data.contentType;
    const content = req.body.data.content;
    const categories = [""];
    const published = new Date().toISOString();
    const visibility = req.body.data.visibility;
    const unlisted = !req.body.data.listed;
    const image = req.body.data.image;

    //Get the author's document
    //Should be refactored to do use an aggregate pipeline in case of large number of posts
    let post_history = await Post_History.findOne({authorId: authorId});

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
            unlisted: unlisted,
            image: image
        });
    }
    else{
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
            unlisted: unlisted,
            image: image
        });
    }

    post_history = await Post_History.findOne({authorId: authorId});
    post_history.posts.push(post);
    post_history.num_posts = post_history.num_posts + 1;
    await post_history.save();

    res.sendStatus(200);

    return;
}

async function get_post(req, res){
    console.log("Get Post");

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
    if(post.length == 0)
        return res.sendStatus(404);
    return res.json(post);
}

async function get_posts_paginated(req, res){
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
    console.log(posts);
    return res.sendStatus(200);
}

async function update_post(req, res){
    console.log("Update Post");

    const authorId = req.params.author_id;
    const postId = req.params.post_id;

    const title = req.body.title;
    const desc = req.body.desc;
    const contentType = req.body.contentType;
    const content = req.body.content;
    const categories = [""];
    const visibility = req.body.visibility;
    const unlisted = !req.body.listed;

    const post_history = await Post_History.findOne({authorId: authorId});

    const post = post_history.posts.id(postId)

    if(title != post.title)
        post.title = title;
    if(desc != post.description)
        post.description = desc;
    if(contentType != post.contentType)
        post.contentType = contentType;
    if(content != post.content)
        post.content = content;
    if(visibility != post.visibility)
        post.visibility = visibility;
    if(unlisted != post.unlisted)
        post.unlisted = unlisted;
    //TODO: UPDATE CATEGORIES

    await post_history.save()
    console.log("Saved");

    return res.sendStatus(200);
}

async function delete_post(req, res){
    console.log("Delete Post");

    const authorId = req.params.author_id;
    const postId = req.params.post_id;

    const post_history = await Post_History.findOne({authorId: authorId});

    if(post_history == undefined)
        return sendStatus(500);

    const post = await post_history.posts.id(postId);
    if(post == null)
        return res.sendStatus(404);

    post.remove();
    post_history.num_posts = post_history.num_posts - 1;
    post_history.save();

    return res.sendStatus(200);
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
    editComment
}
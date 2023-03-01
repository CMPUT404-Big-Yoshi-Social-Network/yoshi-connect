const { author_scheme, login_scheme } = require('../db_schema/author_schema.js');
const { post_history_scheme, post_scheme } = require('../db_schema/post_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;

const Author = database.model('Author', author_scheme);
const Login = database.model('Login', login_scheme);
const Post_History = database.model('Posts', post_history_scheme);

/*
Check if the author_id provided matches the authorid attached to the token
*/
async function same_author(req, author_id){
    token = req.cookies["token"];

    const login = await Login.findOne({token: token});
    if(login == undefined)
        return false;

    if(login.authorId == author_id)
        return true;
    return false;
}

function create_post_history(author_id){
    let new_post_history = new Post_History ({
        authorId: author_id,
        num_posts: 0,
        posts: []
    })

    //Might need an await here, not sure
    new_post_history.save()

    return;
}

async function create_post(req, res, postId){
    //TODO Make sure the author is the correct author (probably make this its own function)
    const authorId = req.params.author_id;
    if(await same_author(req, authorId) == false)
        return res.sendStatus(401);

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
    const post_history = await Post_History.findOne({authorId: authorId});
   
    if(postId == undefined){
        post_history.posts.push({
            title: title,
            description: desc,
            contentType: contentType,
            content: content,
            authorId: authorId,
            categories: categories,
            count: 0,
            comments: "",
            published: published,
            visibility: visibility,
            unlisted: unlisted,
            image: image
        });
    }
    else{
        post_history.posts.push({
            _id: postId,
            title: title,
            description: desc,
            contentType: contentType,
            content: content,
            authorId: authorId,
            categories: categories,
            count: 0,
            comments: "",
            published: published,
            visibility: visibility,
            unlisted: unlisted,
            image: image
        });
    }

    post_history.num_posts = post_history.num_posts + 1;
    await post_history.save();

    res.sendStatus(200);

    return;
}

async function get_post(req, res){
    //TODO Make sure the author is the correct author (probably make this its own function)
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
    //TODO Make sure the author is the correct author (probably make this its own function)
    console.log("Update Post");

    authorId = req.params.author_id;
    postId = req.params.post_id;

    if(await same_author(req, authorId) == false)
        return res.sendStatus(401);

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
    //TODO Make sure the author is the correct author (probably make this its own function)
    console.log("Delete Post");

    const authorId = req.params.author_id;
    const postId = req.params.post_id;

    if(await same_author(req, authorId) == false)
        return res.sendStatus(401);

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
    delete_post
}
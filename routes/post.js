const { author_scheme, login_scheme } = require('../db_schema/author_schema.js');
const { post_history_scheme, post_scheme } = require('../db_schema/post_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;

const Author = database.model('Author', author_scheme);
const Login = database.model('Login', login_scheme);
const Post_History = database.model('Posts', post_history_scheme);

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

async function create_post(req, res){

    login_promise = Login.findOne({token: req.cookies["token"]})

    //Setup the rest of the post
    const title = req.body.title;
    const desc = req.body.desc;
    const contentType = req.body.contentType;
    const content = req.body.content;
    const categories = [""];
    const published = new Date().toISOString();
    const visibility = req.body.visibility;
    const unlisted = !req.body.listed;


    login = await login_promise;
    if(login == undefined)
        return res.sendStatus(403);

    const authorId = login.authorId;
    if (authorId != req.params.author_id)
        return res.sendStatus(401);
    
    //Get the author's document
    //Should be refactored to do use an aggregate pipeline in case of large number of posts
    const post_history = await Post_History.findOne({authorId: authorId});
    
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
        unlisted: unlisted
    });

    post_history.num_posts = post_history.num_posts + 1;
    await post_history.save();

    res.sendStatus(200);

    return;
}

async function get_post(req, res){
    console.log("Get Post");

    authorId = req.params.author_id;
    postId = req.params.post_id;
    console.log(authorId);
    console.log(postId)

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

async function update_post(req, res){
    console.log("Update Post");

    authorId = req.params.author_id;
    postId = req.params.post_id;

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
        return sendStatus(404);

    const post = await post_history.posts.id(postId);
    if(post == null)
        return res.sendStatus(404);

    post.remove();    
    post_history.save();

    return res.sendStatus(200);
}

module.exports={
    create_post_history,
    create_post,
    get_post,
    update_post,
    delete_post
}
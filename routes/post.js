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

    //Get the author's document
    const authorId = (await login_promise).authorId;

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
    })

    await post_history.save();

    res.sendStatus(200);

    return;
}

function get_post(){
    console.log("Get Post");
}

function update_post(){
    console.log("Update Post")
}

function delete_post(){
    console.log("Delete Post")
}

module.exports={
    create_post_history,
    create_post,
    get_post,
    update_post,
    delete_post
}
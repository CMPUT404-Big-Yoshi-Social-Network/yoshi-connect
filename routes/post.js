const { post_scheme } = require('../db_schema/post_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;

const Author = database.model('Author', author_scheme);
const Login = database.model('Login', login_scheme);
const Post = database.model('Posts', post_scheme);

async function create_post(req, res){
    console.log(req.body);

    login_promise = Login.findOne({token: req.cookies["token"]})

    //Setup the rest of the post
    const title = req.body.title;
    const desc = req.body.description;
    let contentType = "";
    if(req.body.contentType === "Plain text")
        contentType = "type/plain";
    else if (req.body.contentType === "Markdown")
        contentType = "text/markdown";
    const content = req.body.content;
    const categories = [""];
    const published = new Date().toISOString();
    const visibility = req.body.visibility;
    const unlisted = !req.body.listed;

    //Get the author's document
    const authorId = (await login_promise).authorId;

    let post_creation = new Post({
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
}

module.exports={
    create_post
}
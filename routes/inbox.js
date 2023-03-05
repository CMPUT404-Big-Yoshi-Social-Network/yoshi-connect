const { PostHistory, Post, Like, Comment, Inbox } = require('../db_schema/post_schema.js');
const { Friend } = require('../db_schema/author_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

async function createInbox(username, authorId){
    await Inbox({
        authorId: authorId,
        username: username,
        posts: [],
        likes:[],
        comments: [],
        requests: []
    }).save();

    return;
}

async function getInbox(req, res){
    console.log('Debug: Paging the posts')
    const authorId = req.params.author_id;

    let page = 1;
    let size = 5;
    if(req.query.page != undefined) { page = req.query.page; }
    if(req.query.size != undefined) { size = req.query.size; }

    const start_index = (page - 1) * size; 
    const end_index = page * size;

    let post = await Inbox.aggregate([
        {
            $match: {'authorId': authorId}
        },
        {
            $project: {_id: 1, posts: {$slice: ["$posts", start_index, end_index]}}
        },
        {
            $unwind: "$posts"
        },
    ]);

    return res.json(post);
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
        const specifics = req.body.specifics;
        const visibility = req.body.visibility;
        const unlisted = req.body.unlisted //Expected to be false
        const authorId = req.body.authorId;

        console.log(title, id, description, contentType, content, categories, count, comments, published, visibility, unlisted, authorId)

        if( title === undefined || id === undefined || description === undefined || contentType === undefined || content === undefined || categories === undefined || count === undefined || comments === undefined|| published === undefined || visibility === undefined || unlisted === undefined || authorId === undefined ){
            return res.sendStatus(400);
        }
    
        const post = Post({
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
    }
    else if(req.body.type === "follow") {

    }
    else if(req.body.type === "like") {

    }
    else if (req.body.type === "comment") {

    }
    else {
        res.sendStatus(400);
    }
}

async function postInboxPost(post, authorId){
    const inbox = await Inbox.findOne({authorId: authorId}, '_id posts');

    inbox.posts.push(post);
    inbox.save();
}

async function deleteInbox(req, res){

}

module.exports = {
    createInbox,
    getInbox,
    postInbox,
    deleteInbox,
    postInboxPost,
}
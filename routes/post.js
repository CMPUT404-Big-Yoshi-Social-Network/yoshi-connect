const { post_scheme } = require('../db_schema/post_schema.js');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const database = mongoose.connection;

const Post = database.model('Posts', post_scheme);

function create_post(req, res){
    console.log(req.body)
}

module.exports={
    create_post
}
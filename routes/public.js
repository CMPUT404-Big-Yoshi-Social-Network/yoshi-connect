/*
Copyright 2023 Kezziah Camille Ayuno, Alinn Martinez, Tommy Sandanasamy, Allan Ma, Omar Niazie

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.


Furthermore it is derived from the Python documentation examples thus
some of the code is Copyright © 2001-2013 Python Software
Foundation; All Rights Reserved
*/

// Database
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

// UUID
const crypto = require('crypto');

// Schemas
const { PublicPost } = require('../scheme/post.js');
const { OutgoingCredentials } = require('../scheme/server');
const axios = require('axios');
const { CommentHistory } = require('../scheme/interactions.js');

async function getPublicLocalPosts(page, size) {
    /**
    Description: Gets the posts associated with authorId
    Associated Endpoint: /authors/:authorId/posts/public
    Request Type: GET
    Request Body: { authorId: 29c546d45f564a27871838825e3dbecb, postId: 902sq546w5498hea764r80re0z89becb }
    Return: 400 Status (Bad Request) -- Invalid post
            500 Status (Internal Server Error) -- Unable to save public post in database
            200 Status (OK) -- Returns JSON with type and items (all posts)
    */
    // TODO: Paging

    if(!page) page = 1;
    if(!size) size = 5;

    page = parseInt(page);
    size = parseInt(size);

    if(page < 0 || size < 0) return [{}, 400];

    let aggregatePipeline = [
        {
            $set: {
                "published": {
                    $dateFromString: { dateString: "$published" }
                }
            }
        },
        {
            $sort: { "published": -1 }
        },
        {
            $limit: size ? size : 5
        },
    ]

    if(page > 1){
        aggregatePipeline.splice(2, 0, {
            $skip: (page - 1) * size
        });
    }

    let publicPosts = await PublicPost.aggregate(aggregatePipeline)
    if(!publicPosts) return [[], 500];

    for(let i = 0; i < publicPosts.length; i++){
        let post = publicPosts[i];
        if (post.author.host === 'https://yoshi-connect.herokuapp.com/') { 
            let commentHistory = await CommentHistory.findOne({postId: post._id});
            post.author.authorId = post.author._id != undefined ? post.author._id.split("/") : post.author.authorId;
            post.author.authorId = post.author._id != undefined ? post.author.authorId[post.author.authorId.length - 1] : post.author.authorId;
            post.author.id = post.author._id;
            post.id = post.author.host + "authors/" + post.author.authorId + '/posts/' + post._id;
            post.comments = post.id + "/comments";
            post.count = post.commentCount;
            post.commentsSrc = {
                type: "comments",
                page: 1,
                side: 5,
                post: post.author.host + "authors/" + post.author.authorId + '/posts/' + post._id,
                id: post.author.host + "authors/" + post.author.authorId + '/posts/' + post._id + '/comments/',
                comments: commentHistory !== null ? commentHistory.comments : []
            }
            delete post.commentCount;
            delete post._id;
            delete post.author._id;
        }
        publicPosts[i] = post;
    }

    response = {
        page: page,
        size: size,
        items: publicPosts
    }
    return [response, 200];
}

async function getPublicPostsXServer(page, size){
    let [response, statusCode] = await getPublicLocalPosts(page, size)
    const outgoings = await OutgoingCredentials.find().clone();
    
    let promiseQueue = [];
    for(let i = 0; i < outgoings.length; i++) {
        const outgoing = outgoings[i];
        const host = outgoing.url;
        let endpoint = "";
        var config = '';
        let auth = outgoing.auth;
        if (outgoings[i].allowed) {
            if(host == "http://www.distribution.social/api"){
                endpoint = "/posts/public"
                var config = {
                    url: host + endpoint,
                    method: 'GET',
                    host: host,
                    headers:{
                        'Content-Type': 'application/json',
                        'Authorization': auth,
                        'Accept': 'application/json'
                    }
                }
            }
            else if(host == "https://sociallydistributed.herokuapp.com"){
                endpoint = "/posts/public"
                var config = {
                    url: host + endpoint,
                    method: 'GET',
                    host: host,
                    headers:{
                        'Content-Type': 'application/json',
                        'Authorization': auth,
                        'Accept': 'application/json'
                    },
                    params: {
                        page: page,
                        size: size,
                    }
                }
            }
            else if(host == "https://bigger-yoshi.herokuapp.com/api"){
                endpoint = "/authors/posts";
                var config = {
                    url: host + endpoint,
                    method: 'GET',
                    host: host,
                    headers:{
                        'Content-Type': 'application/json',
                        'Authorization': auth,
                        'Accept': 'application/json'
                    },
                    params: {
                        page: page,
                        size: size,
                    }
                }
            }
    
            promiseQueue.push(
                axios.request(config)
                .then((res) => {
                    if(res.data.items != undefined && Array.isArray(res.data.items) && res.data.items.length != 0){
                        response.items = response.items.concat(res.data.items);
                    }
                    else if(res.data != undefined && Array.isArray(res.data) && res.data.length != 0){
                        response.items = response.items.concat(res.data);
                    }
                })
                .catch((err) => {
                })
            )
        }
    }

    for(let i = 0; i < promiseQueue.length; i++){
        await promiseQueue[i];
    }

    response.items.sort((post1, post2) => {
        return new Date(post2.published) - new Date(post1.published);
    })

    response.items = response.items.slice(0, size);

    return [response, statusCode]
}

module.exports={
    getPublicLocalPosts,
    getPublicPostsXServer
}

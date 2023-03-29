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
const { Login } = require('../scheme/author.js');
const { Following } = require('../scheme/relations.js');
const { PostHistory, PublicPost } = require('../scheme/post.js');
const { OutgoingCredentials } = require('../scheme/server');
const axios = require('axios');

async function fetchPublicPosts(page, size, isLocal) {
    /**
    Description: 
    Associated Endpoint: (for example: /authors/:authorid)
    Request Type: 
    Request Body: (for example: { username: kc, email: 123@aulenrta.ca })
    Return: 200 Status (or maybe it's a JSON, specify what that JSON looks like)
    */
    // TODO: Paging
    if(!page) page = 1;
    if(!size) size = 5;

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
            $limit: size
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
        if (post.author != undefined) {
            post.author.authorId = post.author._id != undefined ? post.author._id.split("/") : post.author.authorId ;
            post.author.authorId = post.author._id != undefined ? post.author.authorId[post.author.authorId.length - 1] : post.author.authorId;
            post.id = process.env.DOMAIN_NAME + "authors/" + post.author.authorId + '/posts/' + post._id;
            post.comments = post.id + "/comments";
            delete post._id;
        }
    }

    if (isLocal) {
        const outgoings = await OutgoingCredentials.find().clone();

        for (let i = 0; i < outgoings.length; i++) {
            if (outgoings[i].allowed || outgoings[i].url !== 'https://bigger-yoshi.herokuapp.com/api') {
                const auth = outgoings[i].auth === 'userpass' ? { username: outgoings[i].displayName, password: outgoings[i].password } : outgoings[i].auth
                if (outgoings[i].auth === 'userpass') {
                    var config = {
                        host: outgoings[i].url,
                        url: outgoings[i].url + '/posts/public/',
                        method: 'GET',
                        auth: auth,
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        params: {
                            page: page,
                            size: size
                        },
                        data: {
                            local: false
                        }
                    };
                } else {
                    var config = {
                        host: outgoings[i].url,
                        url: outgoings[i].url + '/posts/public',
                        method: 'GET',
                        headers: {
                            'Authorization': auth,
                            'Content-Type': 'application/json'
                        },
                        params: {
                            page: page,
                            size: size
                        }
                    };
                }
          
                await axios.request(config)
                .then(res => {
                    let items = []
                    if (outgoings[i].auth === 'userpass') { 
                        items = res.data.filter((i)=>i !== null && typeof i !== 'undefined');
                    } else {
                        if (typeof(res.data) != string) {
                            items = res.data.items.filter((i)=>i !== null && typeof i !== 'undefined');
                        }
                    }
                    publicPosts = publicPosts.concat(items);
                })
                .catch( error => { })
            }
        }
    }

    response = {
        items: publicPosts
    }
    return [response, 200];
}

module.exports={
    fetchPublicPosts
}

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

async function fetchPublicPosts(page, size) {
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
        post.author.authorId = post.author._id.split("/");
        post.author.authorId = post.author.authorId[post.author.authorId.length - 1];
        post.author.id = post.author._id;
        delete post.author._id;
        post.id = process.env.DOMAIN_NAME + "authors/" + post.author.authorId + '/posts/' + post._id;
        post.comments = post.id + "/comments";
        delete post._id;
        post.count = post.commentCount;
        delete post.commentCount;
    }

    response = {
        items: publicPosts
    }
    
    return [response, 200];
    // const outgoings = await OutgoingCredentials.find().clone();

    // for (let i = 0; i < outgoings.length; i++) {
    //     if (outgoings[i].allowed) {
    //         const auth = outgoings[i].auth === 'userpass' ? { username: outgoings[i].displayName, password: outgoings[i].password } : outgoings[i].auth
    //         if (outgoings[i].auth === 'userpass') {
    //             var config = {
    //                 host: outgoings[i].url,
    //                 url: outgoings[i].url + '/posts/public',
    //                 method: 'GET',
    //                 auth: auth,
    //                 headers: {
    //                     'Content-Type': 'application/json'
    //                 }
    //             };
    //         } else {
    //             var config = {
    //                 host: outgoings[i].url,
    //                 url: outgoings[i].url + '/posts/public',
    //                 method: 'GET',
    //                 headers: {
    //                     'Authorization': auth,
    //                     'Content-Type': 'application/json'
    //                 }
    //             };
    //         }
      
    //         await axios.request(config)
    //         .then( res => {
    //             let items = []
    //             if (outgoings[i].auth === 'userpass') {
    //                 items = res.data.results
    //             } else {
    //                 items = res.data.items
    //             }
    //             for (let j = 0; j < items.length; j++) {
    //                 publicPosts.push(items[j]);
    //             }
    //         })
    //         .catch( error => {
    //             console.log(error);
    //         })
    //     }
    // }
    /* 
    var config = {
        host: 'http://www.distribution.social/api',
        url: 'http://www.distribution.social/api/authors/2b8099db-ea53-46cd-8833-18da83a33e29/posts',
        method: 'GET',
        headers: {
            'Authorization': 'Basic eW9zaGk6eW9zaGkxMjM=',
            'Content-Type': 'application/json'
        }
    };
    await axios.request(config)
    .then( res => { })
    .catch( error => {  })

    var config = {
        host: 'https://sociallydistributed.herokuapp.com',
        url: 'https://sociallydistributed.herokuapp.com/posts/authors/546de5fe-77ea-4cc2-93f9-7a3825132d68/posts/',
        method: 'GET',
        auth: { username: 'Yoshi_Connects', password: 'MinionConnector1' },
        headers: {
            'Content-Type': 'application/json'
        }
    };
    await axios.request(config)
    .then( res => { 
        publicPosts = publicPosts.concat(res.data.results) 
    })
    .catch( error => { })

    var config = {
        host: 'https://bigger-yoshi.herokuapp.com/api',
        url: 'https://bigger-yoshi.herokuapp.com/api/authors/6421fdb1000041ba410007/posts/',
        method: 'GET',
        headers: {
            'Authorization': 'Basic bWFuOjEyMw==',
            'Content-Type': 'application/json'
        }
    };
    await axios.request(config)
    .then( res => {
        publicPosts = publicPosts.concat(res.data.items) 
    })
    .catch( error => {
        console.log('Error')
    })

    
    
    /*
    const outgoings = await OutgoingCredentials.find().clone();
    
    // TODO: WORKING ON THIS WIP
    let fposts = [];
    /*
    for (let i = 0; i < 1; i++) {
        var config = {
            host: outgoings[i].url,
            url: outgoings[i].url + "/api/authors/2b8099db-ea53-46cd-8833-18da83a33e29/posts",
            method: 'GET',
            headers: {
                'Authorization': outgoings[i].auth,
                'Content-Type': 'application/json'
            }
        };
        console.log(config)
        await axios.request(config)
        .then( res => {
            let items = res.data.items
            fposts = fposts.concat(items);
        })
        .catch( error => {
            console.log(error);
        })
    }
    */
    /*
    let response = await axios.get('http://www.distribution.social/api/authors/2b8099db-ea53-46cd-8833-18da83a33e29/posts', {
        headers: {
            'Authorization': 'Basic eW9zaGk6eW9zaGkxMjM=',
            'Content-Type': 'application/json'
        }
    })

    let allPosts = null;
    if (publicPosts[0] != undefined && posts != undefined) {
        allPosts = posts[0].posts_array.concat(publicPosts[0].publicPosts);
    } else if (posts != undefined && posts[0]?.posts_array != undefined) {
        allPosts = posts[0].posts_array;
    } else if (publicPosts[0] != undefined) {
        allPosts = publicPosts[0].publicPosts;
    } else {
        allPosts = [];
    }
    */
    // Remove duplicates (https://stackoverflow.com/questions/2218999/how-to-remove-all-duplicates-from-an-array-of-objects)
    //allPosts = allPosts.filter( (postA, i, arr) => arr.findIndex( postB => ( postB._id === postA._id ) ) === i )

    /*WIP*/
    /*
    for(let i = 0; i < response.data.items.length; i++){
        allPosts.push(response.data.items[i]);
    }

    if (allPosts && isPublicExists){
        return res.json({
            type: "posts",
            items: allPosts
          });
    }
    */

}

module.exports={
    fetchPublicPosts
}

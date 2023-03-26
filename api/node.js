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

// Router Setup
const express = require('express'); 

// Routing Functions 
const { getCreds, getCred, postCred, putCred, allowNode, deleteCred } = require('../routes/node');
const { OutgoingCredentials } = require('../scheme/server');
const axios = require('axios');

// OpenAPI
const {options} = require('../openAPI/options.js');

// Swaggerio
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require('swagger-jsdoc');
const openapiSpecification = swaggerJsdoc(options);

// Router
const router = express.Router({mergeParams: true});

/**
 * @openapi
 * /nodes/outgoing:
 *  get:
 *    summary: INSERT
 *    tags:
 *      - outgoing 
 */
router.get('/outgoing', async (req, res) => { 
    let page = req.query.page;
    let size = req.query.size;
  
    if (page == undefined) page = 1;
    if (size == undefined) size = 5;
    await getCreds(res, page, size, req.cookies.token, 'outgoing'); 
})

/**
 * @openapi
 * /nodes/outgoing/:credId:
 *  get:
 *    summary: INSERT
 *    tags:
 *      - outgoing 
 */
router.get('/outgoing/:credId', async (req, res) => { 
    await getCred(res, req.cookies.token, req.params.credId, 'outgoing'); 
})

/**
 * @openapi
 * /nodes/outgoing/:credId:
 *  put:
 *    summary: INSERT
 *    tags:
 *      - outgoing 
 */
router.put('/outgoing/:credId', async (req, res) => {
    if (req.body.status == 'modify') {
        await putCred(req, res, req.params.credId, req.cookies.token, 'outgoing'); 
    } else {
        await allowNode(res, req.params.credId, 'outgoing');
    }
})

/**
 * @openapi
 * /nodes/outgoing:
 *  post:
 *    summary: INSERT
 *    tags:
 *      - outgoing 
 */
router.post('/outgoing', async (req, res) => {
    await postCred(req, res, req.cookies.token, 'outgoing'); 
})

/**
 * @openapi
 * /nodes/outgoing/:credId:
 *  delete:
 *    summary: INSERT
 *    tags:
 *      - outgoing 
 */
router.delete('/outgoing/:credId', async (req, res) => { 
    await deleteCred(req.cookies.token, req.params.credId, 'outgoing'); 
})

/**
 * @openapi
 * /nodes/outgoing/authors:
 *  get:
 *    summary: INSERT
 *    tags:
 *      - remote 
 */
router.get('/outgoing/authors', async (req, res) => {
    const outgoings = await OutgoingCredentials.find().clone();
    
    let authors = [];

    for (let i = 0; i < outgoings.length; i++) {
        if (outgoings[i].allowed) {
            var config = {
                host: outgoings[i].url,
                url: outgoings[i].url + '/authors',
                method: 'GET',
                headers: {
                    'Authorization': outgoings[i].auth,
                    'Content-Type': 'application/json'
                }
            };
    
            await axios.request(config)
            .then( res => {
                let items = res.data.items
                authors = authors.concat(items);
            })
            .catch( error => {
                console.log(error);
            })
        }
    }
    return res.json({
        'type': 'authors',
        items: authors
    })
})

/**
 * @openapi
 * /nodes/outgoing/authors/:authorId:
 *  get:
 *    summary: INSERT
 *    tags:
 *      - remote 
 */
router.get('/outgoing/authors/:authorId', async (req, res) => {
    const outgoings = await OutgoingCredentials.find().clone();
    
    let author = null;

    for (let i = 0; i < outgoings.length; i++) {
        if (outgoings[i].allowed) {
            var config = {
                host: outgoings[i].url,
                url: outgoings[i].url + '/authors' + req.params.authorId,
                method: 'GET',
                headers: {
                    'Authorization': outgoings[i].auth,
                    'Content-Type': 'application/json'
                }
            };
    
            await axios.request(config)
            .then( res => {
                if (!res.data) {
                    author = res.data;
                }
            })
            .catch( error => {
                if (error.response.status == 404) {
                    console.log('Debug: This server does not have this author.')
                }
            })
        }
    }
    return res.json(author)
})

/**
 * @openapi
 * /nodes/outgoing/authors/:authorId/posts/:postId:
 *  get:
 *    summary: INSERT
 *    tags:
 *      - remote 
 */
router.get('/outgoing/authors/:authorId/posts/:postId', async (req, res) => {
    const outgoings = await OutgoingCredentials.find().clone();
    
    let post = null;

    for (let i = 0; i < outgoings.length; i++) {
        if (outgoings[i].allowed) {
            var config = {
                host: outgoings[i].url,
                url: outgoings[i].url + '/authors' + req.params.authorId + '/posts/' + req.params.postId,
                method: 'GET',
                headers: {
                    'Authorization': outgoings[i].auth,
                    'Content-Type': 'application/json'
                }
            };
    
            await axios.request(config)
            .then( res => {
                if (!res.data) {
                    post = res.data;
                }
            })
            .catch( error => {
                if (error.response.status == 404) {
                    console.log('Debug: This server does not have this post.')
                }
            })
        }
    }
    return res.json(post)
})

/**
 * @openapi
 * /nodes/outgoing/authors/:authorId/posts/:postId/image:
 *  get:
 *    summary: INSERT
 *    tags:
 *      - remote 
 */
router.get('/outgoing/authors/:authorId/posts/:postId/image', async (req, res) => {
    const outgoings = await OutgoingCredentials.find().clone();
    
    let image = null;

    for (let i = 0; i < outgoings.length; i++) {
        if (outgoings[i].allowed) {
            var config = {
                host: outgoings[i].url,
                url: outgoings[i].url + '/authors' + req.params.authorId + '/posts/' + req.params.postId + '/image',
                method: 'GET',
                headers: {
                    'Authorization': outgoings[i].auth,
                    'Content-Type': 'application/json'
                }
            };
    
            await axios.request(config)
            .then( res => {
                if (!res.data) {
                    image = res.data;
                }
            })
            .catch( error => {
                if (error.response.status == 404) {
                    console.log('Debug: This server does not have this post.')
                }
            })
        }
    }
    return res.json(image)
})

/**
 * @openapi
 * /nodes/outgoing/posts:
 *  get:
 *    summary: INSERT
 *    tags:
 *      - remote 
 */
router.get('/outgoing/posts', async (req, res) => {
    const outgoings = await OutgoingCredentials.find().clone();
    
    let posts = [];

    for (let i = 0; i < outgoings.length; i++) {
        if (outgoings[i].allowed) {
            var config = {
                host: outgoings[i].url,
                url: outgoings[i].url + '/posts',
                method: 'GET',
                headers: {
                    'Authorization': outgoings[i].auth,
                    'Content-Type': 'application/json'
                },
                params: {
                    page: req.query.page,
                    size: req.query.size
                }
            };
        
            await axios.request(config)
            .then( res => {
                let items = res.data.items
                posts = posts.concat(items);
            })
            .catch( error => {
                console.log(error);
            })
        }
    }
    
    return res.json({
        'type': 'posts',
        items: posts
    })
})

/**
 * @openapi
 * /nodes/outgoing/authors/:authorId/posts/:postId/comments:
 *  get:
 *    summary: INSERT
 *    tags:
 *      - remote 
 */
router.get('/outgoing/authors/:authorId/posts/:postId/comments', async (req, res) => {
    const outgoings = await OutgoingCredentials.find().clone();
    
    let comments = [];

    for (let i = 0; i < outgoings.length; i++) {
        if (outgoings[i].allowed) {
            var config = {
                host: outgoings[i].url,
                url: outgoings[i].url + '/authors' + req.params.authorId + '/posts/' + req.params.postId + '/comments',
                method: 'GET',
                headers: {
                    'Authorization': outgoings[i].auth,
                    'Content-Type': 'application/json'
                },
                params: {
                    page: req.query.page,
                    size: req.query.size
                }
            };
    
            await axios.request(config)
            .then( res => {
                let items = res.data.items
                comments = comments.concat(items);
            })
            .catch( error => {
                if (error.response.status == 404) {
                    console.log('Debug: This server does not have this post.')
                }
            })
        }
    }
    return res.json({
        'type': 'comments', 
        items: comments
    })
})

/**
 * @openapi
 * /nodes/outgoing/authors/:authorId/followers:
 *  get:
 *    summary: INSERT
 *    tags:
 *      - remote 
 */
router.get('/outgoing/authors/:authorId/followers', async (req, res) => {
    const outgoings = await OutgoingCredentials.find().clone();
    
    let followers = [];

    for (let i = 0; i < outgoings.length; i++) {
        if (outgoings[i].allowed) {
            var config = {
                host: outgoings[i].url,
                url: outgoings[i].url + '/authors' + req.params.authorId + '/followers',
                method: 'GET',
                headers: {
                    'Authorization': outgoings[i].auth,
                    'Content-Type': 'application/json'
                }
            };
    
            await axios.request(config)
            .then( res => {
                if (!res.data) {
                    let items = res.data.items
                    followers = items;                
                }
            })
            .catch( error => {
                if (error.response.status == 404) {
                    console.log('Debug: This is not the correct server that has this Author follower list.')
                }
            })   
        } 
    }
    return res.json({
        'type': 'followers',
        items: followers
    })
})

/**
 * @openapi
 * /nodes/outgoing/authors/:authorId/followers/:foreignId:
 *  get:
 *    summary: INSERT
 *    tags:
 *      - remote 
 */
router.get('/outgoing/authors/:authorId/followers/:foreignId', async (req, res) => {
    const outgoings = await OutgoingCredentials.find().clone();
    
    let follower = null;

    for (let i = 0; i < outgoings.length; i++) {
        if (outgoings[i].allowed) {
            var config = {
                host: outgoings[i].url,
                url: outgoings[i].url + '/authors' + req.params.authorId + '/followers/' + req.params.foreignId,
                method: 'GET',
                headers: {
                    'Authorization': outgoings[i].auth,
                    'Content-Type': 'application/json'
                }
            };
    
            await axios.request(config)
            .then( res => {
                if (!res.data) {
                    follower = res.data;              
                }
            })
            .catch( error => {
                if (error.response.status == 404) {
                    console.log('Debug: This is not the correct server that has this Author follower.')
                }
            })   
        } 
    }
    return res.json(follower)
})

/**
 * @openapi
 * /nodes/outgoing/authors/:authorId/inbox/like:
 *  post:
 *    summary: INSERT
 *    tags:
 *      - remote 
 */
router.post('/outgoing/authors/:authorId/inbox/like', async (req, res) => {
    const outgoings = await OutgoingCredentials.find().clone();

    for (let i = 0; i < outgoings.length; i++) {
        if (outgoings[i].allowed) {
            var config = {
                host: outgoings[i].url,
                url: outgoings[i].url + '/authors' + req.params.authorId + '/inbox',
                method: 'POST',
                headers: {
                    'Authorization': outgoings[i].auth,
                    'Content-Type': 'application/json'
                },
                data: {
                    type: 'like',
                    like: req.body.like
                }
            };
    
            await axios.request(config)
            .then( res => { })
            .catch( error => {
                if (error.response.status == 404) {
                    console.log('Debug: Like cannot be sent to inbox since Author does not exist in this server.')
                } 
            })
        }
    }
    return res.sendStatus(200);
})

/**
 * @openapi
 * /nodes/outgoing/authors/:authorId/posts/:postId/likes:
 *  get:
 *    summary: INSERT
 *    tags:
 *      - remote 
 */
router.get('/outgoing/authors/:authorId/posts/:postId/likes', async (req, res) => {
    const outgoings = await OutgoingCredentials.find().clone();
    
    let likes = [];

    for (let i = 0; i < outgoings.length; i++) {
        if (outgoings[i].allowed) {
            var config = {
                host: outgoings[i].url,
                url: outgoings[i].url + '/authors' + req.params.authorId + '/posts/' + req.params.postId + '/likes',
                method: 'GET',
                headers: {
                    'Authorization': outgoings[i].auth,
                    'Content-Type': 'application/json'
                }
            };
    
            await axios.request(config)
            .then( res => {
                if (!res.data) {
                    let items = res.data.items
                    likes = items;                
                }
            })
            .catch( error => {
                if (error.response.status == 404) {
                    console.log('Debug: This is not the correct server that has this Author like list.')
                }
            })   
        } 
    }
    return res.json({
        'type': 'likes',
        items: likes
    })
})

/**
 * @openapi
 * /nodes/outgoing/authors/:authorId/posts/:postId/comments/:commentId/likes:
 *  get:
 *    summary: INSERT
 *    tags:
 *      - remote 
 */
router.get('/outgoing/authors/:authorId/posts/:postId/comments/:commentId/likes', async (req, res) => {
    const outgoings = await OutgoingCredentials.find().clone();
    
    let likes = [];

    for (let i = 0; i < outgoings.length; i++) {
        if (outgoings[i].allowed) {
            var config = {
                host: outgoings[i].url,
                url: outgoings[i].url + '/authors' + req.params.authorId + '/posts/' + req.params.postId + '/comments' + req.params.commentId + '/likes',
                method: 'GET',
                headers: {
                    'Authorization': outgoings[i].auth,
                    'Content-Type': 'application/json'
                }
            };
    
            await axios.request(config)
            .then( res => {
                if (!res.data) {
                    let items = res.data.items
                    likes = items;                
                }
            })
            .catch( error => {
                if (error.response.status == 404) {
                    console.log('Debug: This is not the correct server that has this Author like list.')
                }
            })  
        }  
    }
    return res.json({
        'type': 'likes',
        items: likes
    })
})

/**
 * @openapi
 * /nodes/outgoing/authors/:authorId/liked:
 *  get:
 *    summary: INSERT
 *    tags:
 *      - remote 
 */
router.get('/outgoing/authors/:authorId/liked', async (req, res) => {
    const outgoings = await OutgoingCredentials.find().clone();
    
    let liked = null;

    for (let i = 0; i < outgoings.length; i++) {
        if (outgoings[i].allowed) {
            var config = {
                host: outgoings[i].url,
                url: outgoings[i].url + '/authors' + req.params.authorId + '/liked',
                method: 'GET',
                headers: {
                    'Authorization': outgoings[i].auth,
                    'Content-Type': 'application/json'
                }
            };
    
            await axios.request(config)
            .then( res => {
                if (!res.data) {
                    liked = res.data;
                }
            })
            .catch( error => {
                if (error.response.status == 404) {
                    console.log('Debug: This server does not have this liked object.')
                }
            })
        }
    }
    return res.json(liked)
})

/**
 * @openapi
 * /nodes/outgoing/authors/:authorId/inbox/:type:
 *  post:
 *    summary: INSERT
 *    tags:
 *      - remote 
 */
router.post('/outgoing/authors/:authorId/inbox/:type', async (req, res) => {
    const outgoings = await OutgoingCredentials.find().clone();

    for (let i = 0; i < outgoings.length; i++) {
        if (outgoings[i].allowed) {
            var config = {
                host: outgoings[i].url,
                url: outgoings[i].url + '/authors' + req.params.authorId + '/inbox',
                method: 'POST',
                headers: {
                    'Authorization': outgoings[i].auth,
                    'Content-Type': 'application/json'
                },
                data: {
                    type: req.params.type,
                    item: req.body.item
                }
            };
    
            await axios.request(config)
            .then( res => { })
            .catch( error => {
                if (error.response.status == 404) {
                    console.log('Debug: Adding an object (post, follow, like) to inbox.')
                } 
            })
        }
    }
    return res.sendStatus(200);
})

/**
 * @openapi
 * /nodes/incoming:
 *  get:
 *    summary: INSERT
 *    tags:
 *      - incoming 
 */
router.get('/incoming', async (req, res) => { 
    // Getting our credentials from other nodes
    let page = req.query.page;
    let size = req.query.size;
  
    if (page == undefined) page = 1;
    if (size == undefined) size = 5;
    await getCreds(res, page, size, req.cookies.token, 'incoming'); 
})

/**
 * @openapi
 * /nodes/incoming/:credId:
 *  get:
 *    summary: INSERT
 *    tags:
 *      - incoming 
 */
router.get('/incoming/:credId', async (req, res) => { 
    // Getting our credentials from other nodes given the credId
    await getCred(res, req.cookies.token, req.params.credId, 'incoming'); 
})

/**
 * @openapi
 * /nodes/incoming:
 *  post:
 *    summary: INSERT
 *    tags:
 *      - incoming 
 */
router.post('/incoming', async (req, res) => {
    // Storing credentials from other nodes 
    await postCred(req, res, req.cookies.token, 'incoming'); 
})

/**
 * @openapi
 * /nodes/incoming/:credId:
 *  put:
 *    summary: INSERT
 *    tags:
 *      - incoming 
 */
router.put('/incoming/:credId', async (req, res) => {
    if (req.body.status == 'modify') {
        await putCred(req, res, req.params.credId, req.cookies.token, 'incoming'); 
    } else {
        await allowNode(res, req.params.credId, 'incoming');
    }
})

/**
 * @openapi
 * /nodes/incoming/:credId:
 *  delete:
 *    summary: INSERT
 *    tags:
 *      - incoming 
 */
router.delete('/incoming/:credId', async (req, res) => { 
    // Deleting credentials for us (in database)
    await deleteCred(req.cookies.token, req.params.credId, 'incoming'); 
})

module.exports = router;
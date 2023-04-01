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

// TBA
/**
 * @openapi
 * /nodes/outgoing:
 *  get:
 *    summary: Fetches the nodes used to communicate with other servers
 *    tags:
 *      - outgoing 
 *    parameters:
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          minimum: 1
 *        description: Page of outgonig nodes requested
 *      - in: query
 *        name: size
 *        schema: 
 *          type: integer
 *          minimum: 5
 *        description: Number of outgoing nodes on a Page requested
 */
router.get('/outgoing', async (req, res) => { 
    let page = req.query.page;
    let size = req.query.size;
  
    if (page == undefined) page = 1;
    if (size == undefined) size = 5;
    await getCreds(res, page, size, req.cookies.token, 'outgoing'); 
})

// TBA
/**
 * @openapi
 * /nodes/outgoing/authors:
 *  get:
 *    summary: Fetches remote authors from outgoing nodes (communicates with other servers)
 *    tags:
 *      - remote 
 */
router.get('/outgoing/authors', async (req, res) => {
    const outgoings = await OutgoingCredentials.find().clone();
    
    let authors = [];

    for (let i = 0; i < outgoings.length; i++) {
        if (outgoings[i].allowed) {
            const auth = outgoings[i].auth === 'userpass' ? { username: outgoings[i].displayName, password: outgoings[i].password } : outgoings[i].auth
            if (outgoings[i].auth === 'userpass') {
                var config = {
                    host: outgoings[i].url,
                    url: outgoings[i].url + '/authors/',
                    method: 'GET',
                    auth: auth,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
            } else {
                var config = {
                    host: outgoings[i].url,
                    url: outgoings[i].url + '/authors',
                    method: 'GET',
                    headers: {
                        'Authorization': auth,
                        'Content-Type': 'application/json'
                    }
                };
            }
    
            await axios.request(config)
            .then( res => {
                let items = []
                if (outgoings[i].auth === 'userpass') {
                    items = res.data.results
                } else {
                    items = res.data.items
                }
                authors = authors.concat(items);
            })
            .catch( error => { })
        }
    }
    return res.json({
        'type': 'authors',
        items: authors
    })
})

// TBA
/**
 * @openapi
 * /nodes/outgoing/:credId:
 *  get:
 *    summary: Fetches a specific node used to communicate with a specific server
 *    tags:
 *      - outgoing 
 *    parameters:
 *      - in: path
 *        name: credId
 *        description: id of outgoing node
 *        schema:
 *          type: string
 */
router.get('/outgoing/:credId', async (req, res) => { 
    await getCred(res, req.cookies.token, req.params.credId, 'outgoing'); 
})

// TBA
/**
 * @openapi
 * components:
 *   schemas:
 *     UpdateOutcomingNode:
 *         type: object
 *         properties: 
 *           newUsername: 
 *             type: string
 *             description: new username for node
 *           newPassword:
 *             type: string
 *             description: new password for node
 *           newHost:
 *             type: string
 *             description: new host url 
 * /nodes/outgoing/:credId:
 *  put:
 *    summary: Modifies an existing node that communicates with other servers or enables / disables this node
 *    tags:
 *      - outgoing 
 *    parameters:
 *      - in: path
 *        name: credId
 *        description: id of outgoing node
 *        schema:
 *          type: string
 *    requestBody: 
 *     content:
 *       application/x-wwwm-form-urlencoded:
 *         schema:
 *           - $ref: '#/components/schemas/UpdateOutcomingNode'
 *         examples:
 *           UpdateOutcomingNode:
 *             value:
 *               newUsername: pass123
 *               newPassword: badpassword
 *               newHost: http://localhost:3000/api/forreal
 */
router.put('/outgoing/:credId', async (req, res) => {
    if (req.body.status == 'modify') {
        await putCred(req, res, req.params.credId, req.cookies.token, 'outgoing'); 
    } else {
        await allowNode(res, req.params.credId, 'outgoing');
    }
})

// TBA
/**
 * @openapi
 * components:
 *   schemas:
 *     OutgoingNode:
 *         type: object
 *         properties: 
 *           url: 
 *             type: string
 *             description: url of remote server we use
 *           password: 
 *             type: string
 *             description: password for outgoing node
 *           allowed:
 *             type: string
 *             description: enabling / disabling boolean for node
 *           displayName:
 *             type: string
 *             description: username of outgoing node
 *           auth:
 *             type: string
 *             description: authentication used for outgoing node 
 * /nodes/outgoing:
 *  post:
 *    summary: Adds a new outgoing node to YoshiConnect database
 *    tags:
 *      - outgoing 
 *    requestBody:
 *      content: 
 *        application/x-wwwm-form-urlencoded:
 *          schema:
 *              - $ref: '#/components/schemas/OutgoingNode'
 *          examples:
 *             OutgoingNode:
 *               value:
 *                 url: http://localhost:3000/api
 *                 displayName: monkey
 *                 password: monkey123
 *                 allowed: false
 *                 auth: 29c546d45f564a27871838825e3dbecb
 */
router.post('/outgoing', async (req, res) => {
    await postCred(req, res, req.cookies.token, 'outgoing'); 
})

// TBA
/**
 * @openapi
 * /nodes/outgoing/:credId:
 *  delete:
 *    summary: Deletes an existing node that communicates with another server
 *    tags:
 *      - outgoing 
 *    parameters:
 *      - in: path
 *        name: credId
 *        description: id of outgoing node
 *        schema:
 *          type: string
 */
router.delete('/outgoing/:credId', async (req, res) => { 
    await deleteCred(req.cookies.token, req.params.credId, 'outgoing'); 
})

// TBA
/**
 * @openapi
 * /nodes/outgoing/authors/:authorId:
 *  get:
 *    summary: Fetches a remote author from another server
 *    tags:
 *      - remote 
 *    parameters:
 *      - in: path
 *        name: authorId
 *        description: id of remote author
 *        schema:
 *          type: string
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

// TBA
/**
 * @openapi
 * /nodes/outgoing/authors/:authorId/posts/:postId:
 *  get:
 *    summary: Fetches a specific post made by a specific remote author
 *    tags:
 *      - remote 
 *    parameters:
 *      - in: path
 *        name: authorId
 *        description: id of remote author
 *        schema:
 *          type: string
 *      - in: path
 *        name: postId
 *        description: id of post made by remote author
 *        schema:
 *          type: string
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

// TBA
/**
 * @openapi
 * /nodes/outgoing/authors/:authorId/posts/:postId/image:
 *  get:
 *    summary: Fetches a specific image associated with a post made by a remote author
 *    tags:
 *      - remote 
 *    parameters:
 *      - in: path
 *        name: authorId
 *        description: id of remote author
 *        schema:
 *          type: string
 *      - in: path
 *        name: postId
 *        description: id of post made by remote author
 *        schema:
 *          type: string
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

// TBA
/**
 * @openapi
 * /nodes/outgoing/posts:
 *  get:
 *    summary: Fetches posts from remote servers 
 *    tags:
 *      - remote 
 */
router.get('/outgoing/authors/:authorId/posts', async (req, res) => {
    const outgoings = await OutgoingCredentials.find().clone();
    let posts = [];

    for (let i = 0; i < outgoings.length; i++) {
        if (outgoings[i].allowed) {
            const auth = outgoings[i].auth === 'userpass' ? { username: outgoings[i].displayName, password: outgoings[i].password } : outgoings[i].auth
            if (outgoings[i].auth === 'userpass') {
                var config = {
                    host: outgoings[i].url,
                    url: outgoings[i].url + '/posts/authors/' + req.params.authorId + '/posts/',
                    method: 'GET',
                    auth: auth,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    params: {
                        page: req.query.page,
                        size: req.query.size
                    }
                };
            } else {
                if (outgoings[i].url === 'https://bigger-yoshi.herokuapp.com') {
                  var config = {
                    host: outgoings[i].url + '/api',
                    url: outgoings[i].url + '/authors/' + req.params.authorId + '/posts/',
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
              } else {
                  var config = {
                    host: outgoings[i].url,
                    url: outgoings[i].url + '/authors/' + req.params.authorId + '/posts',
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
              }
            }

            await axios.request(config)
            .then( res => {
                let items = []
                if (outgoings[i].auth === 'userpass') { 
                    items = res.data.results.filter((i)=>i !== null && typeof i !== 'undefined');
                } else {
                    items = res.data.items.filter((i)=>i !== null && typeof i !== 'undefined');
                }
                posts = posts.concat(items);
            })
            .catch(error => { })
        }
    }
    return res.json({
        'type': 'posts',
        items: posts
    })
})

// TBA
/**
 * @openapi
 * /nodes/outgoing/authors/:authorId/posts/:postId/comments:
 *  get:
 *    summary: Fetches the comments for a post made by a remote author
 *    tags:
 *      - remote 
 *    parameters:
 *      - in: path
 *        name: authorId
 *        description: id of remote author
 *        schema:
 *          type: string
 *      - in: path
 *        name: postId
 *        description: id of post made by remote author
 *        schema:
 *          type: string
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

// TBA
/**
 * @openapi
 * /nodes/outgoing/authors/:authorId/followers:
 *  get:
 *    summary: Fetches followers of a specific remote author
 *    tags:
 *      - remote 
 *    parameters:
 *      - in: path
 *        name: authorId
 *        description: id of remote author
 *        schema:
 *          type: string
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

// TBA
/**
 * @openapi
 * /nodes/outgoing/authors/:authorId/followers/:foreignId:
 *  get:
 *    summary: Fetches a specific follower of a remote author
 *    tags:
 *      - remote 
 *    parameters:
 *      - in: path
 *        name: authorId
 *        description: id of remote author
 *        schema:
 *          type: string
 *      - in: path
 *        name: foreignId
 *        description: id of specific follower of remote author
 *        schema:
 *          type: string
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

// TBA
/**
 * @openapi
 * components:
 *   schemas:
 *     Like:
 *         type: object
 *         properties: 
 *           '@context': 
 *             type: string
 *             description: context of like
 *           summary:
 *             type: string
 *             description: who liked the post
 *           type:
 *             type: string
 *             description: type of object (like)
 *           author: 
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: type of object (author)
 *               id: 
 *                 type: string
 *                 description: id of author
 *               host:
 *                 type: string
 *                 description: host of author
 *               displayName: 
 *                 type: string
 *                 description: username of author
 *               url: 
 *                 type: string
 *                 description: url of author
 *               github: 
 *                 type: string
 *                 description: associated GitHub of author
 *               profileImage: 
 *                 type: string
 *                 description: profile picture of author
 *           object: 
 *             type: string
 *             description: id of like
 * /nodes/outgoing/authors/:authorId/inbox/like:
 *  post:
 *    summary: Posts a like to a remote author's inbox
 *    tags:
 *      - remote 
 *    parameters:
 *      - in: path
 *        name: authorId
 *        description: id of remote author
 *        schema:
 *          type: string
 *    requestBody:
 *      content: 
 *        application/x-wwwm-form-urlencoded:
 *          schema:
 *            - $ref: '#/components/schemas/Like'
 *          example:
 *            "@context": https://www.w3.org/ns/activitystreams
 *            summary: Lara Croft Likes your post       
 *            type: Like
 *            author:
 *              type: author
 *              id: http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e
 *              host: http://127.0.0.1:5454/
 *              displayName: Lara Croft
 *              url: http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e
 *              github: http://github.com/laracroft
 *              profileImage: https://i.imgur.com/k7XVwpB.jpeg
 *            object: http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/764efa883dda1e11db47671c4a3bbd9e
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

// TBA
/**
 * @openapi
 * /nodes/outgoing/authors/:authorId/posts/:postId/likes:
 *  get:
 *    summary: Fetches the likes from a specific post made by a remote author
 *    tags:
 *      - remote 
 *    parameters:
 *      - in: path
 *        name: authorId
 *        description: id of remote author
 *        schema:
 *          type: string
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

// TBA
/**
 * @openapi
 * /nodes/outgoing/authors/:authorId/posts/:postId/comments/:commentId/likes:
 *  get:
 *    summary: Fetches the likes associated with a comment on a post made by a remote author
 *    tags:
 *      - remote 
 *    parameters:
 *      - in: path
 *        name: authorId
 *        description: id of remote author
 *        schema:
 *          type: string
 *      - in: path
 *        name: postId
 *        description: id of post made by remote author
 *        schema:
 *          type: string
 *      - in: path
 *        name: commentId
 *        description: id of comment made by an author
 *        schema:
 *          type: string
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

// TBA
/**
 * @openapi
 * /nodes/outgoing/authors/:authorId/liked:
 *  get:
 *    summary: Fetches the liked object of a remote author 
 *    tags:
 *      - remote 
 *    parameters:
 *      - in: path
 *        name: authorId
 *        description: id of remote author
 *        schema:
 *          type: string
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

// TBA
/**
 * @openapi
 * components:
 *   schemas:
 *     ExampleObject:
 *         type: object
 *         properties: 
 *           type: 
 *             type: string
 *             description: type of object (comment)
 *           comment:
 *             type: string
 *             description: comment that was made 
 *           contentType:
 *             type: string
 *             description: content type (text/plain or markdown)
 * /nodes/outgoing/authors/:authorId/inbox/:type:
 *  post:
 *    summary: Adds a certain object to the remote author's inbox (specificed by type)
 *    tags:
 *      - remote 
 *    parameters:
 *      - in: path
 *        name: authorId
 *        description: id of remote author
 *        schema:
 *          type: string
 *      - in: path
 *        name: type
 *        description: type of object from remote author's inbox
 *        schema:
 *          type: string
 *    requestBody: 
 *     content:
 *       application/x-wwwm-form-urlencoded:
 *         schema:
 *           - $ref: '#/components/schemas/ExampleObject'
 *         examples:
 *           ExampleObject:
 *             value:
 *               type: comment
 *               comment: Monkey, monkey!
 *               contentType: text/plain
 */
router.post('/outgoing/authors/:authorId/inbox/:type', async (req, res) => {
    const outgoings = await OutgoingCredentials.find().clone();

    for (let i = 0; i < outgoings.length; i++) {
        if (outgoings[i].allowed) {
            const auth = outgoings[i].auth === 'userpass' ? { username: outgoings[i].displayName, password: outgoings[i].password } : outgoings[i].auth
            if (outgoings[i].auth === 'userpass') {
                var config = {
                    host: outgoings[i].url,
                    url: outgoings[i].url + '/authors/' + req.params.authorId + '/inbox/',
                    method: 'POST',
                    auth: auth,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        type: req.params.type,
                        ...req.body
                    }
                };
            } else {
                if (outgoings[i].url === 'https://bigger-yoshi.herokuapp.com') {
                var config = {
                host: outgoings[i].url + '/api',
                url: outgoings[i].url + '/authors/' + req.params.authorId + '/inbox/',
                method: 'POST',
                headers: {
                    'Authorization': auth,
                    'Content-Type': 'application/json'
                },
                data: {
                    type: req.params.type,
                    ...req.body
                }
                };              
              } else {
                  var config = {
                    host: outgoings[i].url,
                    url: outgoings[i].url + '/authors/' + req.params.authorId + '/inbox',
                    method: 'POST',
                    headers: {
                        'Authorization': auth,
                        'Content-Type': 'application/json'
                    },
                    data: {
                        type: req.params.type,
                        ...req.body
                    }
                  };
              }
            }
            await axios.request(config)
            .then( res => { })
            .catch( error => { })
        }
    }

    return res.sendStatus(200);
})

// TBA
/**
 * @openapi
 * /nodes/incoming:
 *  get:
 *    summary: Fetches all incoming nodes (remote servers use to communicate)
 *    tags:
 *      - incoming 
 *    parameters:
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          minimum: 1
 *        description: Page of Incoming Nodes requested
 *      - in: query
 *        name: size
 *        schema: 
 *          type: integer
 *          minimum: 5
 *        description: Number of Incoming Nodes on a Page requested
 */
router.get('/incoming', async (req, res) => { 
    let page = req.query.page;
    let size = req.query.size;
  
    if (page == undefined) page = 1;
    if (size == undefined) size = 5;
    await getCreds(res, page, size, req.cookies.token, 'incoming'); 
})

// TBA
/**
 * @openapi
 * /nodes/incoming/:credId:
 *  get:
 *    summary: Fetches a specific incoming node using its credential id
 *    tags:
 *      - incoming 
 *    parameters:
 *      - in: path
 *        name: credId
 *        description: id of incoming node
 *        schema:
 *          type: string
 */
router.get('/incoming/:credId', async (req, res) => { 
    await getCred(res, req.cookies.token, req.params.credId, 'incoming'); 
})

// TBA
/**
 * @openapi
 * components:
 *   schemas:
 *     IncomingNode:
 *         type: object
 *         properties: 
 *           url: 
 *             type: string
 *             description: url using our server
 *           password: 
 *             type: string
 *             description: password for incoming node
 *           allowed:
 *             type: string
 *             description: enabling / disabling boolean for node
 *           displayName:
 *             type: string
 *             description: username of incoming node
 *           auth:
 *             type: string
 *             description: authentication used for incoming node 
 * /nodes/incoming:
 *  post:
 *    summary: Stores incoming node (nodes used to communicate with our server)
 *    tags:
 *      - incoming 
 *    requestBody:
 *      content: 
 *        application/x-wwwm-form-urlencoded:
 *          schema:
 *              - $ref: '#/components/schemas/IncomingNode'
 *          examples:
 *             IncomingNode:
 *               value:
 *                 url: http://localhost:3000/api
 *                 displayName: monkey
 *                 password: monkey123
 *                 allowed: false
 *                 auth: 29c546d45f564a27871838825e3dbecb
 */
router.post('/incoming', async (req, res) => {
    await postCred(req, res, req.cookies.token, 'incoming'); 
})

// TBA
/**
 * @openapi
 * components:
 *   schemas:
 *     UpdateIncomingNode:
 *         type: object
 *         properties: 
 *           newUsername: 
 *             type: string
 *             description: new username for node
 *           newPassword:
 *             type: string
 *             description: new password for node
 *           newHost:
 *             type: string
 *             description: new host url 
 * /nodes/incoming/:credId:
 *  put:
 *    summary: Modifies an existing incoming node credentials or enables / disables incoming node 
 *    tags:
 *      - incoming 
 *    parameters:
 *      - in: path
 *        name: credId
 *        description: id of incoming node
 *        schema:
 *          type: string
 *    requestBody: 
 *     content:
 *       application/x-wwwm-form-urlencoded:
 *         schema:
 *           - $ref: '#/components/schemas/UpdateIncomingNode'
 *         examples:
 *           UpdateIncomingNode:
 *             value:
 *               newUsername: pass123
 *               newPassword: badpassword
 *               newHost: http://localhost:3000/api/forreal
 */
router.put('/incoming/:credId', async (req, res) => {
    if (req.body.status == 'modify') {
        await putCred(req, res, req.params.credId, req.cookies.token, 'incoming'); 
    } else {
        await allowNode(res, req.params.credId, 'incoming');
    }
})

// TBA
/**
 * @openapi
 * /nodes/incoming/:credId:
 *  delete:
 *    summary: Deletes an existing incoming node from YoshiConnect database
 *    tags:
 *      - incoming 
 *    parameters:
 *      - in: path
 *        name: credId
 *        description: id of incoming node
 *        schema:
 *          type: string
 */
router.delete('/incoming/:credId', async (req, res) => { 
    await deleteCred(req.cookies.token, req.params.credId, 'incoming'); 
})

module.exports = router;
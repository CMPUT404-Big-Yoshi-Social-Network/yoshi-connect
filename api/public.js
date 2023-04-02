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

// Routing Functions 
const { getPublicLocalPosts, getPublicPostsXServer } = require('../routes/public');

// OpenAPI
const {options} = require('../openAPI/options.js');

// Swaggerio
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require('swagger-jsdoc');
const openapiSpecification = swaggerJsdoc(options);

// Router Setup
const express = require('express'); 

// Router
const router = express.Router({mergeParams: true});

/**
 * @openapi
 * /posts/public:
 *  get:
 *    summary: Gets the public posts
 *    tags:
 *      - public 
 *    parameters:
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          minimum: 1
 *        description: Page of Posts requested
 *      - in: query
 *        name: size
 *        schema: 
 *          type: integer
 *          minimum: 5
 *        description: Number of Posts on a Page requested
 *    responses:
 *      500:
 *        description: Internal Server Error, Unable to save public post in database
 *      200:
 *        description: OK, Returns JSON with type and items (all posts)
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *              description: array of Public posts
 *              example:
 *                - id: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb/posts/2a9887e9fb2c4296aada63cd80aa9f1c
 *                  author: 
 *                    _id: http://localhost:3000/authors/29c546d45f564a27871838825e3dbecb
 *                    displayName: kc
 *                    profileImage: ""
 *                    pronouns: she/her
 *                  origin: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb/posts/2a9887e9fb2c4296aada63cd80aa9f1c
 *                  source: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb/posts/2a9887e9fb2c4296aada63cd80aa9f1c
 *                  title: avocado
 *                  description: hello monkey boy
 *                  contentType: text/plain
 *                  content: MONKEY BUSINESS
 *                  categories: 
 *                    - tag1
 *                  likeCount: 1
 *                  commentCount: 100
 *                  published: 2023-03-27T06:43:18.423Z
 *                  visibility: PUBLIC
 *                  postTo: ""
 *                  unlisted: false
 */
router.get('/', async (req, res) => {
  let page = req.query.page ? parseInt(req.query.page) : 1;
  let size = req.query.size ? parseInt(req.query.size) : 5;

  if(page < 1 || size < 1){
    return res.sendStatus(400);
  }

  const [publicPosts, status] = await getPublicPostsXServer(page, size); 

  if(status != 200) return res.sendStatus(status);
  return res.json(publicPosts);
})

router.get('/local', async (req, res) => { 
  let page = req.query.page ? parseInt(req.query.page) : 1;
  let size = req.query.size ? parseInt(req.query.size) : 5;

  if(page < 1 || size < 1){
    return res.sendStatus(400);
  }

  const [publicPosts, status] = await getPublicLocalPosts(page, size); 

  if(status != 200) return res.sendStatus(status);
  return res.json(publicPosts);
})

module.exports = router;
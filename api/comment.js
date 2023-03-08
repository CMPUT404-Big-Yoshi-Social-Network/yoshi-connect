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

// Setting up database
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config();
mongoose.connect(process.env.ATLAS_URI, {dbName: "yoshi-connect"}).catch(err => console.log(err));

// OpenAPI
const {options} = require('./openAPI/options.js');

// Swaggerio
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require('swagger-jsdoc');
const openapiSpecification = swaggerJsdoc(options);

// App Setup
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const path = require('path');

// Routing Functions 
const { getComments, createComment } = require('./routes/post');

/**
 * @openapi
 * /api/authors/{authorId}/posts/{postId}/comments:
 *  get:
 *    description: Gets the comments related to a specific Post made by a specific Author (paginated)
 *    responses:
 *      200:
 *        description: Returns Status 200 when the comments have been successfully found (i.e., returns list of comments)
 */
app.get('/api/authors/:authorId/posts/:postId/comments', async (req, res) => {
  const authorId = req.params.authorId;
  const postId = req.params.postId;
  let page = req.query.page;
  let size = req.query.size;

  if(page == undefined)
  page = 1;
  if(size == undefined)
    size = 5;

  const comments = getComments(authorId, postId);

  return res.json({
    "type": "comments",
    "page": page,
    "size": size,
    "post": process.env.DOMAIN_NAME + "/authors/" + authorId + "/posts/" + postId,
    "id": process.env.DOMAIN_NAME + "/authors/" + authorId + "/posts/" + postId + "/comments",
    "comments": comments
    })
})

/**
 * @openapi
 * /api/authors/{authorId}/posts/{postId}/comments:
 *  post:
 *    description: Creates a comment for a specific Post made by a specific Author
 *    responses:
 *      200:
 *        description: Returns 200 when the comment was successfully made (i.e., returns the comment)
 */
app.post('/api/authors/:authorId/posts/:postId/comments', async (req, res) => {
  const authorId = req.params.authorId;
  const postId = req.params.postId;

  const comment = createComment(authorId, postId, req.body, process.env.DOMAIN_NAME);

  return res.json({
    "type": "comment",
    "author": comment.author,
    "comment": comment.comment,
    "contentType": comment.contentType,
    "published": comment.published,
    "id": comment._id
    }) 
})
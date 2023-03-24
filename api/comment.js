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
const { getComments, createComment, getComment } = require('../routes/comment');
const { apiFetchCommentLikes } = require('../routes/post');
const { getAuthor } = require('../routes/author');
const { getLikes } = require('../routes/likes');

// OpenAPI
const {options} = require('../openAPI/options.js');

// Swaggerio
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require('swagger-jsdoc');
const openapiSpecification = swaggerJsdoc(options);

// Router Setup
const express = require('express'); 
const { PostHistory } = require('../scheme/post');

// Router
const router = express.Router({mergeParams: true});

// TODO: Waiting for refactor 
router.get('/', async (req, res) => {
  const authorId = req.params.authorId;
  const postId = req.params.postId;
  let page = req.query.page;
  let size = req.query.size;

  if(page == undefined)
    page = 1;
  if(size == undefined)
    size = 5;

  const postHistory = await PostHistory.findOne({authorId: authorId});

  if(!postHistory){
    return res.sendStatus(404);
  }

  let post = postHistory.posts.id(postId);
  if(!post){
    return res.sendStatus(404);
  }

  const [comments, commentStatus] = await getComments(postId, authorId, page, size);

  if(commentStatus != 200 && commentStatus != 404){
    return res.sendStatus(commentStatus);
  }

  return res.json({
    "type": "comments",
    "page": page,
    "size": size,
    "post": process.env.DOMAIN_NAME + "/authors/" + authorId + "/posts/" + postId,
    "id": process.env.DOMAIN_NAME + "/authors/" + authorId + "/posts/" + postId + "/comments",
    "comments": comments
    })
})

router.get('/:commentId', async (req, res) => {
  const [comment, status] = await getComment( req.params.authorId, req.params.postId, req.params.commentId);
  if(status != 200){
    return res.sendStatus(status);
  }

  return res.json(comment);
})

router.post('/', async (req, res) => {
  const postId = req.params.postId;

  const [comment, status] = await createComment(req.cookies.token, req.params.authorId, postId, req.body, process.env.DOMAIN_NAME);

  if(status != 200){
    return res.sendStatus(status);
  }

  return res.json({
    "type": "comment",
    "author": comment.author,
    "comment": comment.comment,
    "contentType": comment.contentType,
    "published": comment.published,
    "id": process.env.DOMAIN_NAME + "/authors/" + req.params.authorId + "/posts/" + req.params.postId + "/comments/" + comment._id
    }) 
})

router.put('/', async (req, res) => {
  console.log('TODO: PUT Request that makes a comment on a post by viewer (can get from token) RESPONSE expected to have response.data.numComments')
})

router.post('/:commentId', async (req, res) => {
  console.log('TODO: POST request that modifies a comment; body has comment for the new comment content')
})

router.delete('/:commentId', async (req, res) => {
  console.log('TODO: DELETE request that deletes a comment from a post')
})

router.get('/:commentId/likes', async (req, res) => {
  const authorId = req.params.authorId;
  const postId = req.params.postId;
  const commentId = req.params.commentId
  let page = req.query.page;
  let size = req.query.size;

  if (page == undefined) { page = 1; }
  if(size == undefined) { size = 5; }

  const [likes, status] = await getLikes(authorId, postId, commentId, "comment"); 

  return res.json({
    "type": "likes",
    "page": page,
    "size": size,
    "post": process.env.DOMAIN_NAME + "/authors/" + authorId + "/posts/" + postId,
    "comment": process.env.DOMAIN_NAME + "/authors/" + authorId + "/posts/" + postId + "/comments/" + commentId,
    "id": process.env.DOMAIN_NAME + "/authors/" + authorId + "/posts/" + postId + "/comments" + commentId + "/likes",
    "likes": likes
    })
 })

module.exports = router;
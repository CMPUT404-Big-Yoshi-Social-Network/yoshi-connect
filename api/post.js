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
const { createPost, updatePost, deletePost, getPost, getPosts, fetchMyPosts, fetchOtherPosts } = require('../routes/post');
const { fetchPublicPosts } = require('../routes/public');
const { fetchFriendPosts } = require('../routes/friend');
const { getAuthor } = require('../routes/author.js');

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
 * /authors/:authorId/posts/public:
 *  get:
 *    description: Gets the posts associated with authorId 
 *    responses:
 *      500:
 *        description: Internal Server Error -- Unable to save public post in database
 *      200:
 *        description: OK -- Returns JSON with type and items (all posts)
 */
router.get('/public', async (req, res) => { await fetchPublicPosts(req, res); })

/**
 * @openapi
 * /authors/:authorId/posts/friends-posts:
 *  get:
 *    description: Gets the friend's posts associated with authorId
 *    responses:
 *      200:
 *        description: Returns either an empty array is the post is undefined, otherwise the friend (authorId) 
 */
router.get('/friends-posts', async (req, res) => { await fetchFriendPosts(req, res); })

/**
 * @openapi
 * /authors/:authorId/posts/personal:
 *  get:
 *    description: Gets the posts associated with authorId for the Author themselves
 *    responses:
 *      200:
 *        description: Returns JSON with the type and the post object
 */
router.get('/personal', async (req, res) => { await fetchMyPosts(req, res); })

/**
 * @openapi
 * /authors/:authorId/posts/other/:other:
 *  get:
 *    description: Gets the posts associated with other for the Author associated with authorId
 *    responses:
 *      200:
 *        description: Returns JSON with either an empty array if the post is undefined, otherwise the post object
 */
router.get('/other/:other', async (req, res) => { await fetchOtherPosts(req, res); })

/**
 * @openapi
 * /authors/:authorId/posts/:postId:
 *  get:
 *    description: Gets the posts associated with postId for the Author associated with authorId
 *    responses:
 *      404:
 *        description: Not Found -- Author ID was not found
 *      404:
 *        description: Not Found -- Post associated with Author was not found
 *      200:
 *        description: OK -- Returns Authour's post 
 */
router.get('/:postId', async (req, res) => {
  if (req.params.authorId == undefined) { return res.sendStatus(404); }

  const authorId = req.params.authorId;
  const postId = req.params.postId;

  let [post, status] = await getPost(authorId, postId);

  if (status != 200) { return res.sendStatus(status); }

  return res.json(post);
})

/**
 * @openapi
 * /authors/:authorId/posts/:postId:
 *  post:
 *    description: Sends the posts associated with postId for the Author associated with authorId to update the post
 *    responses:
 *      401:
 *        description: Unauthorized -- Author token is not authenticated
 *      500:
 *        description: Internal Server Error -- Unable to fetch post history from database
 *      404:
 *        description: Not Found -- Post was not found
 *      200:
 *        description: Ok -- Returns the updated post object
 *      200:
 *        description: Ok -- Returns JSON of the post object 
 */
router.post('/:postId', async (req, res) => {
  const authorId = req.params.authorId;
  const postId = req.params.postId;

  if (!req.cookies.token) { res.sendStatus(401); }

  const [post, status] = await updatePost(req.cookies.token, authorId, postId, req.body);
  
  if (status == 200) {
    return res.json(post);
  } else {
    return res.sendStatus(status);
  }
})

/**
 * @openapi
 * /authors/:authorId/posts/:postId:
 *  delete:
 *    description: Deletes the posts associated with postId for the Author associated with authorId to delete the post
 *    responses:
 *      401:
 *        description: Unauthorized -- Author token is not authenticated
 *      500:
 *        description: Internal Server Error -- Unable to fetch post history from database
 *      404:
 *        description: Not Found -- Post was not found
 *      200:
 *        description: Ok -- Returns JSON of the deleted post object
 */
router.delete('/:postId', async (req, res) => {
  const authorId = req.params.authorId;
  const postId = req.params.postId;

  if (!req.cookies.token) { return res.sendStatus(401); }

  const [post, status] = await deletePost(req.cookies.token, authorId, postId);

  if (status == 200) {
    return res.json(post);
  } else {
    return res.sendStatus(status);
  } 
})

/**
 * @openapi
 * /authors/:authorId/posts/:postId:
 *  put:
 *    description: Puts the posts associated with postId for the Author associated with authorId to create a post
 *    responses:
 *      401:
 *        description: Unauthorized -- Author token is not authenticated
 *      400:
 *        description: Bad Request -- The fields 'title', 'desc', 'content', or 'visibility' were not given
 *      400:
 *        description: Bad Request -- Post ID is already in use
 *      200:
 *        description: Ok -- Returns JSON the newly created post object
 */
router.put('/:postId', async (req, res) => {
  const authorId = req.params.authorId;
  const postId = req.params.postId;

  if (!req.cookies.token) { return res.sendStatus(401); }

  const [post, status] = await createPost(req.cookies.token, authorId, postId, req.body);

  if (status == 200) {
    return res.json(post);
  } else {
    return res.sendStatus(status);
  }
})

/**
 * @openapi
 * /authors/:authorId/posts:
 *  get:
 *    description: Gets the posts associated with authorId
 *    responses:
 *      500:
 *        description: Internal Server Error -- Unable to fetch Author from database
 *      200:
 *        description: OK -- Returns Author
 *      404:
 *        description: Not Found -- Author was not found
 *      200:
 *        description: Ok -- Returns the sanitized Author
 *      400:
 *        description: Bad Request -- Post history details did not match 
 *      200:
 *        description: OK -- Returns JSON with type and post objects
 */
router.get('/', async (req, res) => {
  const authorId = req.params.authorId;
  
  let page = req.query.page ? parseInt(req.query.page) : 1;
  let size = req.query.size ? parseInt(req.query.size) : 5; 

  let [author, status] = await getAuthor(authorId);

  if (status != 200 || author.admin) { return res.sendStatus(status); }

  [posts, status] = await getPosts(page, size, author);

  if (status != 200) { return res.sendStatus(status); }

  return res.json({
    "type": "posts",
    "items": posts
  });
})

/**
 * @openapi
 * /authors/:authorId/posts:
 *  post:
*    description: Sends the posts associated with authorId
 *    responses:
 *      401:
 *        description: Unauthorized -- Author token is not authenticated
 *      400:
 *        description: Bad Request -- The fields 'title', 'desc', 'content', or 'visibility' were not given
 *      400:
 *        description: Bad Request -- Post ID is already in use
 *      200:
 *        description: Ok -- Returns JSON the newly created post object
 */
router.post('/', async (req, res) => {
  const authorId = req.params.authorId;

  if (!req.cookies.token) { return res.sendStatus(401); }

  const [post, status] = await createPost(req.cookies.token, authorId, undefined, req.body.data);

  if (status == 200) {
    return res.json(post);
  } else {
    return res.sendStatus(status); 
  }
})

module.exports = router;
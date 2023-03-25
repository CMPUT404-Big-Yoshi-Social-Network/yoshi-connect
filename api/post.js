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
const { createPost, updatePost, deletePost, getPost, getPosts, fetchMyPosts, fetchOtherPosts, uploadImage, getImage, editImage } = require('../routes/post');
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
const { getLikes } = require('../routes/likes');

// Router
const router = express.Router({mergeParams: true});

/**
 * @openapi
 * /authors/:authorId/posts/public:
 *  get:
 *    summary: Gets the posts associated with authorId 
 *    tags:
 *      - post 
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
 *    summary: Gets the friend's posts associated with authorId
 *    tags:
 *      - following 
 *    responses:
 *      200:
 *        description: Returns either an empty array is the post is undefined, otherwise the friend (authorId) 
 */
router.get('/friends-posts', async (req, res) => { await fetchFriendPosts(req, res); })

/**
 * @openapi
 * /authors/:authorId/posts/personal:
 *  get:
 *    summary: Gets the posts associated with authorId for the Author themselves
 *    tags:
 *      - following 
 *    responses:
 *      200:
 *        description: Returns JSON with the type and the post object
 */
router.get('/personal', async (req, res) => { await fetchMyPosts(req, res); })

/**
 * @openapi
 * /authors/:authorId/posts/other/:other:
 *  get:
 *    summary: Gets the posts associated with other for the Author associated with authorId
 *    tags:
 *      - post 
 *    responses:
 *      200:
 *        description: Returns JSON with either an empty array if the post is undefined, otherwise the post object
 */
router.get('/other/:other', async (req, res) => { await fetchOtherPosts(req, res); })

/**
 * @openapi
 * /authors/:authorId/posts/:postId:
 *  get:
 *    summary: Gets the posts associated with postId for the Author associated with authorId
 *    tags:
 *      - post 
 *    responses:
 *      404:
 *        description: Not Found -- Author ID was not found or Post associated with Author was not found
 *      200:
 *        description: OK -- Returns Authour's post 
 */
router.get('/:postId', async (req, res) => {
  if (req.params.authorId == undefined) { return res.sendStatus(404); }

  const authorId = req.params.authorId;
  const postId = req.params.postId;

  let [author, authorStatus] = await getAuthor(authorId);

  if(authorStatus != 200){
    return res.sendStatus(authorStatus);
  }

  let [post, postStatus] = await getPost(postId, req.cookies.token, author);

  if (postStatus != 200) { return res.sendStatus(postStatus); }

  return res.json(post);
})

/**
 * @openapi
 * /authors/:authorId/posts/:postId:
 *  post:
 *    summary: Sends the posts associated with postId for the Author associated with authorId to update the post
 *    tags:
 *      - post 
 *    responses:
 *      401:
 *        description: Unauthorized -- Author token is not authenticated
 *      500:
 *        description: Internal Server Error -- Unable to fetch post history from database
 *      404:
 *        description: Not Found -- Post was not found
 *      200:
 *        description: Ok -- Returns a JSON of the updated post object
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
 *    summary: Deletes the posts associated with postId for the Author associated with authorId to delete the post
 *    tags:
 *      - post 
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
 *    summary: Puts the posts associated with postId for the Author associated with authorId to create a post
 *    tags:
 *      - post 
 *    responses:
 *      401:
 *        description: Unauthorized -- Author token is not authenticated
 *      400:
 *        description: Bad Request -- The fields 'title', 'desc', 'content', or 'visibility' were not given or the post already exists
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
 *    summary: Gets the posts associated with authorId
 *    tags:
 *      - post 
 *    responses:
 *      500:
 *        description: Internal Server Error -- Unable to fetch Author from database
 *      404:
 *        description: Not Found -- Author was not found
 *      400:
 *        description: Bad Request -- Post history details did not match 
 *      200:
 *        description: OK -- Returns JSON with type and post objects from the author
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
 *    summary: Sends the posts associated with authorId
 *    tags:
 *      - post 
 *    responses:
 *      401:
 *        description: Unauthorized -- Author token is not authenticated
 *      400:
 *        description: Bad Request -- The fields 'title', 'desc', 'content', or 'visibility' were not given or Post ID is already in use
 *      200:
 *        description: Ok -- Returns JSON the newly created post object
 */
router.post('/', async (req, res) => {
  const authorId = req.params.authorId;

  if (!req.cookies.token) { return res.sendStatus(401); }

  const [post, status] = await createPost(req.cookies.token, authorId, undefined, req.body);

  if (status == 200) {
    return res.json(post);
  }
  return res.sendStatus(status); 
})

router.get('/:postId/likes', async (req, res) => {
  const authorId = req.params.authorId;
  const postId = req.params.postId;

  const [likes, status] = await getLikes(authorId, postId, null, "post");

  if(status != 200){
    return res.sendStatus(status)
  }

  return res.json({
    type: "likes",
    items: likes
  });
})

router.put('/:postId/likes', async (req, res) => {
  console.log('TODO: PUT Request that adds a like to the post from viewer (can get from token) RESPONSE expected to have response.data.numLikes')
})

router.delete('/:postId/likes', async (req, res) => {
  console.log('TODO: DELETE Request that deletes a like to the post from viewer (can get from token) RESPONSE expected to have response.data.numLikes')
})

router.get('/:postId/liked', async (req, res) => {
  //TODO we can refactor this endpoint to take multiple posts which will allow us to amortize the amount of time spent searching for public posts
  //Or we can merge public posts with getting liked posts
  console.log('TODO: GET Request that detects whether a post has already been liked by the viewer (which you can get from token); 200 means liked, 404 not liked etc')
})

router.post("/:postId/image", async (req, res) => {  
  const [image, status] = await editImage(req.body.url, req.body.image);

  if (status == 200) {
    return res.json(image);
  } else {
    return res.sendStatus(status)
  }
})

router.put("/:postId/image", async (req, res) => {  
  const [image, status] = await uploadImage(req.body.url, req.body.image);

  if (status == 200) {
    return res.json(image);
  } else {
    return res.sendStatus(status)
  }
})

router.get("/:postId/image", async (req, res) => { 
  const [image, status] = await getImage(req.originalUrl); 
  return res.json({
    src: image,
    status: status
  })
})

module.exports = router;
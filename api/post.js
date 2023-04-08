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
const { createPost, updatePost, deletePost, getPost, getPosts, fetchMyPosts, fetchOtherPosts, uploadImage, sharePost, getImage, editImage, createTombstone } = require('../routes/post');
const { fetchPublicPosts } = require('../routes/public');
const { getAuthor } = require('../routes/author.js');
const { getInbox } = require('../routes/inbox.js');

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
 *    parameters:
 *      - in: path
 *        name: authorId
 *        description: id of author
 *        schema:
 *          type: string
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
 *                  unlisted: false
 */
router.get('/public', async (req, res) => { 
  let page = parseInt(req.query.page);
  let size = parseInt(req.query.size);

  const [publicPosts, status] = await fetchPublicPosts(page, size); 

  if(status != 200) return res.sendStatus(status);
  return res.json(publicPosts);
})

/**
 * @openapi
 * /authors/:authorId/posts/friends-posts:
 *  get:
 *    summary: Gets the friend's posts associated with authorId
 *    tags:
 *      - friend 
 *    parameters:
 *      - in: path
 *        name: authorId
 *        description: id of author
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: OK, Returns either an empty array is the post is undefined, otherwise the friend (authorId) 
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                type: 
 *                  type: string
 *                  example: posts
 *                items:
 *                  type: array
 *                  items:
 *                    type: object
 *                  description: array of Public posts
 *                  example:
 *                    - id: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb/posts/2a9887e9fb2c4296aada63cd80aa9f1c
 *                      author: 
 *                        _id: http://localhost:3000/authors/29c546d45f564a27871838825e3dbecb
 *                        displayName: kc
 *                        profileImage: ""
 *                        pronouns: she/her
 *                      origin: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb/posts/2a9887e9fb2c4296aada63cd80aa9f1c
 *                      source: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb/posts/2a9887e9fb2c4296aada63cd80aa9f1c
 *                      title: avocado
 *                      description: hello monkey boy
 *                      contentType: text/plain
 *                      content: MONKEY BUSINESS
 *                      categories: 
 *                        - tag1
 *                      likeCount: 1
 *                      commentCount: 100
 *                      published: 2023-03-27T06:43:18.423Z
 *                      visibility: PUBLIC
 *                      unlisted: false
 */
router.get('/friends-posts', async (req, res) => { 
  const [posts, status] = await getInbox(req.cookies.token, req.params.authorId, req.query.page, req.query.size); 

	if (status != 200) { return res.sendStatus(status); }

	return res.json(posts);
})

router.get('/personal', async (req, res) => { await fetchMyPosts(req, res); })

router.get('/other/:other', async (req, res) => { await fetchOtherPosts(req, res); })

/**
 * @openapi
 * /authors/:authorId/posts/:postId:
 *  get:
 *    summary: Gets the posts associated with postId for the Author associated with authorId
 *    tags:
 *      - post 
 *    parameters:
 *      - in: path
 *        name: authorId
 *        description: id of author
 *        schema:
 *          type: string
 *      - in: path
 *        name: postId
 *        description: id of post
 *        schema:
 *          type: string
 *    responses:
 *      404:
 *        description: Not Found, Author ID was not found or Post associated with Author was not found
 *      200:
 *        description: OK, Returns Authour's post 
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                type: 
 *                  type: string
 *                  example: post
 *                title: 
 *                  type: string
 *                  example: MONKEYMONKEY
 *                id: 
 *                  type: string
 *                  example: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb/posts/2a9887e9fb2c4296aada63cd80aa9f1c
 *                source: 
 *                  type: string
 *                  example: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb/posts/2a9887e9fb2c4296aada63cd80aa9f1c
 *                origin:
 *                  type: string
 *                  example: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb/posts/2a9887e9fb2c4296aada63cd80aa9f1c
 *                description:
 *                  type: string
 *                  example: monkeyyy
 *                contentType:
 *                  type: string
 *                  example: text/plain
 *                content: 
 *                  type: string
 *                  example: monkey
 *                author: 
 *                  type: object
 *                  properties:
 *                    type: 
 *                      type: string
 *                      example: author
 *                    id: 
 *                      type: string
 *                      example: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *                    authorId: 
 *                      type: string
 *                      example: 29c546d45f564a27871838825e3dbecb
 *                    host: 
 *                      type: string
 *                      example: https://yoshi-connect.herokuapp.com/
 *                    displayName: 
 *                      type: string
 *                      example: kc
 *                    url: 
 *                      type: string
 *                      example: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *                    github: 
 *                      type: string
 *                      example: https://github.com/kezzayuno
 *                    profileImage: 
 *                      type: string
 *                      example: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkIAAADIhkjhaDjkdHfkaSd
 *                    about: 
 *                      type: string
 *                      example: i am a code monkey
 *                    pronouns: 
 *                      type: string
 *                      example: she/her
 *                categories:
 *                  type: array
 *                  items:
 *                    type: string
 *                  example: 
 *                    - tag1
 *                count: 
 *                  type: integer
 *                  example: 0
 *                likeCount:
 *                  type: integer
 *                  example: 0
 *                commentsSrc:
 *                  type: array
 *                  items:
 *                    type: object
 *                  example: 
 *                    - _id: 29c546d45f564a27871838825e3dbecb
 *                      author: 
 *                        _id: 37c546d45f564a27871838826e3dbec8
 *                        username: kc
 *                        email: monkey@ualberta.ca
 *                        about: ""
 *                        pronouns: she/her
 *                        github: ""
 *                        profileImage: ""
 *                        admin: false
 *                        allowed: false
 *                      comment: yo monkey
 *                      likeCount: 0
 *                      contentType: text/plain
 *                      published: 2023-03-27T06:43:18.423Z
 *                comments:
 *                  type: string
 *                  example: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb/posts/2a9887e9fb2c4296aada63cd80aa9f1c/comments
 *                published:
 *                  type: string
 *                  example: 2023-03-27T06:43:18.423Z
 *                visibility:
 *                  type: string
 *                  example: PUBLIC
 *                unlisted:
 *                  type: boolean
 *                  example: false
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

// TBA 200
/**
 * @openapi
 * components:
 *   schemas:
 *     UpdatePost:
 *         type: object
 *         properties: 
 *           title: 
 *             type: string
 *             description: title of post
 *           description:
 *             type: string
 *             description: description of post
 *           contentType:
 *             type: string
 *             description: content type of post (text/plain or markdown)
 *           content: 
 *             type: string
 *             description: content of post 
 *           categories: 
 *             type: array
 *             description: categories associated with post
 *             items: 
 *               type: string
 *           visibility: 
 *             type: string
 *             description: level of visibility of a post (private or public)
 *           unlisted: 
 *             type: boolean
 *             description: dictates whether a post is unlisted or not
 * /authors/:authorId/posts/:postId:
 *  post:
 *    summary: Sends the posts associated with postId for the Author associated with authorId to update the post
 *    tags:
 *      - post 
 *    parameters:
 *      - in: path
 *        name: authorId
 *        description: id of author
 *        schema:
 *          type: string
 *      - in: path
 *        name: postId
 *        description: id of post
 *        schema:
 *          type: string
 *    requestBody: 
 *     content:
 *       application/x-wwwm-form-urlencoded:
 *         schema:
 *           - $ref: '#/components/schemas/UpdatePost'
 *         examples:
 *           UpdatePost:
 *             value:
 *               title: MONKEY123
 *               description: monkey yeah!
 *               contentType: text/plain
 *               content: monkey123
 *               categories: 
 *                 - tag1
 *                 - tag23
 *               visibility: Public
 *               unlisted: true
 *    responses:
 *      401:
 *        description: Unauthorized, Author token is not authenticated
 *      500:
 *        description: Internal Server Error, Unable to fetch post history from database
 *      404:
 *        description: Not Found, Post was not found
 *      200:
 *        description: OK, Returns a JSON of the updated post object
 *      400:
 *        description: Improper request body
 */
router.post('/:postId', async (req, res) => {
  const authorId = req.params.authorId;
  const postId = req.params.postId;

  if (!req.cookies.token) { res.sendStatus(401); }

  let [post, status] = [{}, ''];
  if (req.body.status !== undefined && req.body.status === 'share') {
    [post, status] = await sharePost(authorId, req.cookies.token, req.body);
  } else {
    [post, status] = await updatePost(req.cookies.token, authorId, postId, req.body);
  }
  
  if (status == 200) {
    return res.json(post);
  } else {
    return res.sendStatus(status);
  }
})

// TBA 200
/**
 * @openapi
 * /authors/:authorId/posts/:postId:
 *  delete:
 *    summary: Deletes the posts associated with postId for the Author associated with authorId to delete the post
 *    tags:
 *      - post 
 *    parameters:
 *      - in: path
 *        name: authorId
 *        description: id of author
 *        schema:
 *          type: string
 *      - in: path
 *        name: postId
 *        description: id of post
 *        schema:
 *          type: string
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

// TBA 200
/**
 * @openapi
 * /authors/:authorId/posts:
 *  get:
 *    summary: Gets the posts associated with authorId
 *    tags:
 *      - post 
 *    parameters:
 *      - in: path
 *        name: authorId
 *        description: id of author
 *        schema:
 *          type: string
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

  [posts, status] = await getPosts(req.cookies.token, page, size, author);

  if (status != 200) { return res.sendStatus(status); }

  return res.json({
    "type": "posts",
    "items": posts
  });
})

// TBA 200
/**
 * @openapi
 * components:
 *   schemas:
 *     Post:
 *       properties: 
 *         type: 
 *           type: string
 *           description: type of object, post
 *         title:
 *           type: string
 *           description: title of post
 *         description:
 *           type: string
 *           description: description of post
 *         contentType: 
 *           type: string
 *           description: contentType of post 
 *         content: 
 *           type: array
 *           description: content of the post
 *           items: 
 *             type: string
 *         author:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               description: author
 *         categoies:
 *           type: array
 *           description: array of strings that represent categories
 *         visibility: 
 *           type: string
 *           description: level of visibility of a post (private or public)
 *         unlisted: 
 *           type: boolean
 *           description: dictates whether a post is unlisted or not
 * /authors/:authorId/posts:
 *  put:
 *    summary: Creates a new post
 *    tags:
 *      - post 
 *    parameters:
 *      - in: path
 *        name: authorId
 *        description: id of author
 *        schema:
 *          type: string
 *    requestBody: 
 *     content:
 *       application/x-www-form-urlencoded:
 *         schema:
 *           $ref: '#/components/schemas/Post'
 *         example:
 *           type: post
 *           title: I need to show the categories on the post somehow
 *           description: sdjfh
 *           contentType: text/plain
 *           content: asdjh ugh
 *           author:
 *             type: author
 *             id: https://yoshi-connect.herokuapp.com/authors/6151077f9ffb46aba8c9dab7b2ae375c
 *             authorId: 6151077f9ffb46aba8c9dab7b2ae375c
 *             host: https://yoshi-connect.herokuapp.com/
 *             displayName: Kezziah
 *             url: https://yoshi-connect.herokuapp.com/authors/6151077f9ffb46aba8c9dab7b2ae375c
 *             github: https://github.com/kezzayuno
 *             profileImage: https://media.tenor.com/lFoIvXgBojsAAAAC/xayah-eye-roll.gif 
 *             about: I am part of T00. I coded a lot.
 *             pronouns: she/her
 *           cateogries:
 *             - tag1
 *             - tag2
 *           visibility: PUBLIC
 *           unlisted: false 
 *    responses:
 *      401:
 *        description: Unauthorized -- Author token is not authenticated
 *      400:
 *        description: Bad Request -- The fields 'title', 'desc', 'content', or 'visibility' were not given or Post ID is already in use
 *      200:
 *        description: Ok -- Returns JSON the newly created post object
 */
router.put('/', async (req, res) => {
  const authorId = req.params.authorId;

  if (!req.cookies.token) { return res.sendStatus(401); }

  const [post, status] = await createPost(req.cookies.token, authorId, undefined, req.body); 

  if (status == 200) {
    return res.json(post);
  }
  return res.sendStatus(status); 
})

router.post('/:postId/share', async (req, res) => {
  const authorId = req.params.authorId;
  const postId = req.params.postId;

  if (!req.cookies.token) { return res.sendStatus(401); }

  const [post, status] = await sharePost(req.cookies.token, authorId, postId, req.body);

  if (status == 200) { return res.json(post); }
  return res.sendStatus(status);  
})

// TBA
/**
 * @openapi
 * /authors/:authorId/posts/:postId/likes:
 *  get:
 *    summary: Fetches the likes associated with a specific post made by a specific author
 *    tags:
 *      - post 
 *    parameters:
 *      - in: path
 *        name: authorId
 *        description: id of author
 *        schema:
 *          type: string
 *      - in: path
 *        name: postId
 *        description: id of post
 *        schema:
 *          type: string
 */
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

// TBA
/**
 * @openapi
 * /authors/:authorId/posts/:postId/image:
 *  post:
 *    summary: Edits an image associated with a specific post made by a specific author
 *    tags:
 *      - post 
 *    requestBody: 
 *      content: 
 *        multipart/form-data:
 *          schema:
 *            url:
 *              type: string
 *            image:
 *              type: string
 *          example:
 *            url: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb/posts/89c546d45f564a27800838825e3dbece/image
 *            image: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkIAAADIhkjhaDjkdHfkaSd
 *    parameters:
 *      - in: path
 *        name: authorId
 *        description: id of author
 *        schema:
 *          type: string
 *      - in: path
 *        name: postId
 *        description: id of post
 *        schema:
 *          type: string
 */
router.post("/:postId/image", async (req, res) => {  
  const [image, status] = await editImage(req.body.url, req.body.image);

  if (status == 200) {
    return res.json(image);
  } else {
    return res.sendStatus(status)
  }
})

// TBA
/**
 * @openapi
 * /authors/:authorId/posts/:postId/image:
 *  put:
 *    summary: Uploads an image related to a post made by a specific author
 *    tags:
 *      - post 
 *    requestBody: 
 *      content: 
 *        multipart/form-data:
 *          schema:
 *            url:
 *              type: string
 *            image:
 *              type: string
 *          example:
 *            url: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb/posts/89c546d45f564a27800838825e3dbece/image
 *            image: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkIAAADIhkjhaDjkdHfkaSd
 *    parameters:
 *      - in: path
 *        name: authorId
 *        description: id of author
 *        schema:
 *          type: string
 *      - in: path
 *        name: postId
 *        description: id of post
 *        schema:
 *          type: string
 */
router.put("/:postId/image", async (req, res) => {  
  const [image, status] = await uploadImage(req.body.url, req.body.image);

  if (status == 200) {
    return res.json(image);
  } else {
    return res.sendStatus(status)
  }
})

// TBA
/**
 * @openapi
 * /authors/:authorId/posts/:postId/image:
 *  get:
 *    summary: Fetches the image associated with post made by a specific author
 *    tags:
 *      - post 
 *    requestBody: 
 *      content: 
 *        multipart/form-data:
 *          schema:
 *            originalUrl:
 *              type: string
 *          example: 
 *            originalUrl: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb/posts/89c546d45f564a27800838825e3dbece/image
 *    parameters:
 *      - in: path
 *        name: authorId
 *        description: id of author
 *        schema:
 *          type: string
 *      - in: path
 *        name: postId
 *        description: id of post
 *        schema:
 *          type: string
 */
router.get("/:postId/image", async (req, res) => { 
  const [image, status] = await getImage(req.originalUrl); 
  return res.json({
    src: image,
    status: status
  })
})

module.exports = router;
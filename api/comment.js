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

/**
 * @openapi
 * /authors/:authorId/posts/:postId/comments:
 *  get:
 *    summary: Fetches a paginated list of comments for a specific post (dictated by size and page queries)
 *    tags:
 *      - comments
 *    parameters:
 *      - in: path
 *        name: authorId
 *        description: id of Author
 *        schema:
 *          type: string
 *      - in: path
 *        name: postId
 *        description: id of Post 
 *        schema:
 *          type: string
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          minimum: 1
 *        description: Page of Comments requested
 *      - in: query
 *        name: size
 *        schema: 
 *          type: integer
 *          minimum: 5
 *        description: Number of Comments on a Page requested
 *    responses:
 *      404:
 *        description: Not Found, could not find any comments for the specific post
 *      200: 
 *        description: OK, successfully fetched and sanitized comments for a specific post from the database 
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                type:
 *                  type: string
 *                  description: JSON type 
 *                  example: comments
 *                page:
 *                  type: integer
 *                  description: Page of Comments
 *                  example: 1
 *                size:
 *                  type: integer
 *                  description: Size of Comments in a Page
 *                  example: 5
 *                post:
 *                  type: string
 *                  description: URL of post
 *                  example: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb/posts/f08d2d6579d5452ab282512d8cdd10d4
 *                id: 
 *                  type: string
 *                  description: URL of comments
 *                  example: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb/posts/f08d2d6579d5452ab282512d8cdd10d4/comments
 *                comments: 
 *                  type: array
 *                  items: 
 *                    type: object
 *                  description: array of Comment object for specific Post fetched from database 
 *                  example: 
 *                    - type: comments
 *                      author:
 *                        type: author
 *                        id: https://yoshi-connect.herokuapp.com/authors/3ec2a2a0685445509a3ea1dd3093639f
 *                        url: https://yoshi-connect.herokuapp.com/authors/3ec2a2a0685445509a3ea1dd3093639f
 *                        host: https://yoshi-connect.herokuapp.com/
 *                        displayName: allan
 *                        github: https://github.com/Holy-Hero
 *                        profileImage: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkIAAADIhkjhaDjkdHfkaSd
 *                      comment: Monkey is me!
 *                      contentType: text/plain
 *                      published: 2023-03-23T05:39:47.567Z
 *                      id: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb/posts/f08d2d6579d5452ab282512d8cdd10d4/comments/f25cd371afbb4775930fefa6ad8828c4
 *                    - type: comments
 *                      author:
 *                        type: author
 *                        id: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *                        url: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *                        host: https://yoshi-connect.herokuapp.com/
 *                        displayName: kc
 *                        github: https://github.com/kezzayuno
 *                        profileImage: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkIAAADIhkjhaDjkdHfkaSd
 *                      comment: You're a monkey!
 *                      contentType: text/plain
 *                      published: 2023-03-24T06:53:47.567Z
 *                      id: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb/posts/f08d2d6579d5452ab282512d8cdd10d4/comments/c890c904cbd14fee8644f1ab7b7fb66b
 */
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

/**
 * @openapi
 * /authors/:authorId/posts/:postId/comments/:commentId:
 *  get:
 *    summary: Fetches a specific Comment from a specific Post made by a specific Author
 *    tags:
 *      - comments
 *    parameters:
 *      - in: path
 *        name: commentId
 *        description: id of Comment
 *        schema:
 *          type: string
 *      - in: path
 *        name: authorId
 *        description: id of Author
 *        schema:
 *          type: string
 *      - in: path
 *        name: postId
 *        description: id of Post 
 *        schema:
 *          type: string
 *    responses:
 *      404:
 *        description: Not Found, could not find any comment with specific comment Id
 *      200: 
 *        description: OK, successfully fetched and sanitized comment associated with comment Id
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                type:
 *                  type: string
 *                  description: JSON type 
 *                  example: comment
 *                author:
 *                    type: object
 *                    description: Author object
 *                    properties: 
 *                      type: 
 *                        type: string
 *                        description: JSON type
 *                        example: author
 *                      id: 
 *                        type: string
 *                        description: Author id
 *                        example: https://yoshi-connect.herokuapp.com/authors/3ec2a2a0685445509a3ea1dd3093639f
 *                      url: 
 *                        type: string
 *                        description: URL of Author
 *                        example: https://yoshi-connect.herokuapp.com/authors/3ec2a2a0685445509a3ea1dd3093639f
 *                      host: 
 *                        type: string
 *                        description: host associated with Author
 *                        example: https://yoshi-connect.herokuapp.com/
 *                      displayName: 
 *                        type: string
 *                        description: username of Author
 *                        example: allan
 *                      github: 
 *                        type: string
 *                        description: associated GitHub of Author
 *                        example: https://github.com/Holy-Hero
 *                      profileImage: 
 *                        type: string
 *                        description: profile picture of Author
 *                        example: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkIAAADIhkjhaDjkdHfkaSd
 *                comment: 
 *                  type: string
 *                  description: comment made by Author
 *                  example: Monkey, monkey!
 *                contentType:
 *                  type: string
 *                  description: content type of comment 
 *                  example: text/plain
 *                published: 
 *                  type: string
 *                  description: published time of the comment 
 *                  example: 2023-03-24T06:53:47.567Z
 *                id: 
 *                  type: string
 *                  description: comment Id
 *                  example: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb/posts/f08d2d6579d5452ab282512d8cdd10d4/comments/f25cd371afbb4775930fefa6ad8828c4
 */
router.get('/:commentId', async (req, res) => {
  const [comment, status] = await getComment( req.params.authorId, req.params.postId, req.params.commentId);
  if(status != 200){
    return res.sendStatus(status);
  }

  return res.json(comment);
})

/**
 * @openapi
 * components:
 *   schemas:
 *     NewComment:
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
 * /authors/:authorId/posts/:postId/comments:
 *  post:
 *    summary: Creates comment for a specific Post made by a specific Author
 *    tags:
 *      - comments
 *    parameters:
 *      - in: path
 *        name: authorId
 *        description: id of Author
 *        schema:
 *          type: string
 *      - in: path
 *        name: postId
 *        description: id of Post 
 *        schema:
 *          type: string
 *    requestBody:
 *      content: 
 *        application/x-wwwm-form-urlencoded:
 *          schema:
 *            - $ref: '#/components/schemas/NewComment'
 *          example:
 *            NewComment: 
 *              value:
 *                type: comment
 *                comment: Monkey, monkey!
 *                contentType: text/plain
 *    responses:
 *      400: 
 *        description: Bad Request, no comment provided, no Author to be the author of the comment, did not provide content type or type
 *      200: 
 *        description: OK, successfully created comment
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                type:
 *                  type: string
 *                  description: JSON type 
 *                  example: comment
 *                author:
 *                    type: object
 *                    description: Author object
 *                    properties: 
 *                      type: 
 *                        type: string
 *                        description: JSON type
 *                        example: author
 *                      id: 
 *                        type: string
 *                        description: Author id
 *                        example: https://yoshi-connect.herokuapp.com/authors/3ec2a2a0685445509a3ea1dd3093639f
 *                      url: 
 *                        type: string
 *                        description: URL of Author
 *                        example: https://yoshi-connect.herokuapp.com/authors/3ec2a2a0685445509a3ea1dd3093639f
 *                      host: 
 *                        type: string
 *                        description: host associated with Author
 *                        example: https://yoshi-connect.herokuapp.com/
 *                      displayName: 
 *                        type: string
 *                        description: username of Author
 *                        example: allan
 *                      github: 
 *                        type: string
 *                        description: associated GitHub of Author
 *                        example: https://github.com/Holy-Hero
 *                      profileImage: 
 *                        type: string
 *                        description: profile picture of Author
 *                        example: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkIAAADIhkjhaDjkdHfkaSd
 *                comment: 
 *                  type: string
 *                  description: comment made by the Author
 *                  example: Monkey, monkey!
 *                contentType:
 *                  type: string
 *                  description: type of comment  
 *                  example: text/plain
 *                published: 
 *                  type: string
 *                  description: time the comment was made
 *                  example: 2023-03-24T06:53:47.567Z
 *                id: 
 *                  type: string
 *                  description: Comment id
 *                  example: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb/posts/f08d2d6579d5452ab282512d8cdd10d4/comments/f25cd371afbb4775930fefa6ad8828c4
 */
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

/**
 * @openapi
 * /authors/:authorId/posts/:postId/comments:
 *  put:
 *    summary: Makes a comment on a post by viewer
 *    tags:
 *      - comments
 *    parameters:
 *      - in: path
 *        name: authorId
 *        description: id of Author
 *        schema:
 *          type: string
 *      - in: path
 *        name: postId
 *        description: id of Post 
 *        schema:
 *          type: string
 */
router.put('/', async (req, res) => {
  console.log('TODO: PUT Request that makes a comment on a post by viewer (can get from token) RESPONSE expected to have response.data.numComments')
})

/**
 * @openapi
 * /authors/:authorId/posts/:postId/comments/:commentId:
 *  post:
 *    summary: Modifies a comment
 *    tags:
 *      - comments
 *    parameters:
 *      - in: path
 *        name: authorId
 *        description: id of Author
 *        schema:
 *          type: string
 *      - in: path
 *        name: postId
 *        description: id of Post 
 *        schema:
 *          type: string
 *      - in: path
 *        name: commentId
 *        description: id of comment
 *        schema:
 *          type: string
 */
router.post('/:commentId', async (req, res) => {
  console.log('TODO: POST request that modifies a comment; body has comment for the new comment content')
})

/**
 * @openapi
 * /authors/:authorId/posts/:postId/comments/:commentId:
 *  delete:
 *    summary: Deletes a comment
 *    tags:
 *      - comments
 *    parameters:
 *      - in: path
 *        name: authorId
 *        description: id of Author
 *        schema:
 *          type: string
 *      - in: path
 *        name: postId
 *        description: id of Post 
 *        schema:
 *          type: string
 *      - in: path
 *        name: commentId
 *        description: id of comment
 *        schema:
 *          type: string
 */
router.delete('/:commentId', async (req, res) => {
  console.log('TODO: DELETE request that deletes a comment from a post')
})

/**
 * @openapi
 * /authors/:authorId/posts/:postId/comments/:commentId/likes:
 *  post:
 *    summary: Fetches likes of a specific Comment from a specific Post and specific Author
 *    tags:
 *      - comments
 *    parameters:
 *      - in: path
 *        name: commentId
 *        description: id of Comment
 *        schema:
 *          type: string
 *      - in: path
 *        name: authorId
 *        description: id of Author
 *        schema:
 *          type: string
 *      - in: path
 *        name: postId
 *        description: id of Post 
 *        schema:
 *          type: string
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          minimum: 1
 *        description: Page of Likes requested
 *      - in: query
 *        name: size
 *        schema: 
 *          type: integer
 *          minimum: 5
 *        description: Number of Likes on a Page requested
 *    responses:
 *      400: 
 *        description: Bad Request, type not given
 *      404: 
 *        description: Not Found, no likes for the specific Comment exist
 *      200: 
 *        description: OK, fetched and sanitized likes of a specific Comment
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                type:
 *                  type: string
 *                  description: JSON type 
 *                  example: likes
 *                page:
 *                  type: integer
 *                  description: Page of Likes
 *                  example: 1
 *                size: 
 *                  type: integer
 *                  description: Size of likes 
 *                  example: 5
 *                post: 
 *                comment:
 *                id: 
 *                likes: 
 *                  type: array
 *                  items: 
 *                    type: object
 *                  description: array of Like object for specific Comment on a specific Post 
 *                  example: 
 *                    - "@context": https://www.w3.org/ns/activitystreams
 *                      summary: kc likes your post
 *                      type: Like
 *                      author: 
 *                        - type: author
 *                          id: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *                          url: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *                          host: https://yoshi-connect.herokuapp.com/
 *                          displayName: kc
 *                          github: https://github.com/kezzayuno
 *                          profileImage: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkIAAADIhkjhaDjkdHfkaSd
 *                      object: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb/posts/f08d2d6579d5452ab282512d8cdd10d4
 *                    - "@context": https://www.w3.org/ns/activitystreams
 *                      summary: allan likes your post
 *                      type: Like
 *                      author: 
 *                        - type: author
 *                          id: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *                          url: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *                          host: https://yoshi-connect.herokuapp.com/
 *                          displayName: allan
 *                          github: https://github.com/kezzayuno
 *                          profileImage: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkIAAADIhkjhaDjkdHfkaSd
 *                      object: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb/posts/f08d2d6579d5452ab282512d8cdd10d4
 */
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
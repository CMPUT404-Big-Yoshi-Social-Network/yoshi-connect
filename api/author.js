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
const { getAuthor, updateAuthor, getAuthors, fetchMyPosts } = require('../routes/author');

// OpenAPI
const {options} = require('../openAPI/options.js');

// Swaggerio
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require('swagger-jsdoc');
const openapiSpecification = swaggerJsdoc(options);

// Router Setup
const express = require('express'); 

// Schemas
const { Author } = require('../scheme/author');
const { OutgoingCredentials } = require('../scheme/server');

const axios = require('axios');

// Router
const router = express.Router({mergeParams: true});

/**
 * @openapi
 * /authors:
 *  get:
 *    summary: Fetches a paginated list of Authors (dictated by size and page queries)
 *    tags:
 *      - author
 *    parameters:
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          minimum: 1
 *        description: Page of Authors requested
 *      - in: query
 *        name: size
 *        schema: 
 *          type: integer
 *          minimum: 5
 *        description: Number of Authors on a Page requested
 *    responses:
 *      500:
 *        description: Internal Serevr Error, unable to fetch Authors from database
 *      400:
 *        description: Bad Request, incorrect paging requested from the user
 *      200: 
 *        description: OK, successfully fetched and sanitized authors from the database 
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                type:
 *                  type: string
 *                  description: JSON type 
 *                  example: authors
 *                items: 
 *                  type: array
 *                  items: 
 *                    type: object
 *                  description: array of Author object fetched from database 
 *                  example: 
 *                    - type: author
 *                      id: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *                      authorId: 29c546d45f564a27871838825e3dbecb
 *                      host: https://yoshi-connect.herokuapp.com/
 *                      displayName: kc
 *                      url: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *                      github: https://github.com/kezzayuno
 *                      profileImage: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkIAAADIhkjhaDjkdHfkaSd
 *                      about: i am a code monkey
 *                      pronouns: she/her
 *                    - type: author
 *                      id: https://yoshi-connect.herokuapp.com/authors/3ec2a2a0685445509a3ea1dd3093639f
 *                      authorId: 3ec2a2a0685445509a3ea1dd3093639f
 *                      host: https://yoshi-connect.herokuapp.com/
 *                      displayName: allan
 *                      url: https://yoshi-connect.herokuapp.com/authors/3ec2a2a0685445509a3ea1dd3093639f
 *                      github: https://github.com/Holy-Hero
 *                      profileImage: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkIAAADIhkjhaDjkdHfkaSd
 *                      about: i love hatsune miku
 *                      pronouns: he/him
 */
router.get('/', async (req, res) => {

  let page = req.query.page;
  let size = req.query.size;

  if (page == undefined) page = 1;
  if (size == undefined) size = 5;

  const [sanitizedAuthors, status] = await getAuthors(page, size);

  if (status == 500) { return res.sendStatus(500); }
  if (status == 400) { return res.sendStatus(400); }

  return res.json({
    "type": "authors",
    "items": sanitizedAuthors
  });
})

/**
 * @openapi
 * /authors/:authorId:
 *  get:
 *    summary: Fetches a specific Author using authorId params
 *    tags:
 *      - author
 *    parameters:
 *      - in: path
 *        name: authorId
 *        schema:
 *          type: string
 *        description: id of an Author
 *    responses:
 *      404:
 *        description: Not Found, Author was not found in the database
 *      500:
 *        description: Internal Server Error, server experienced 'server failure'
 *      200: 
 *        description: OK, successfully fetched and sanitized the Author from the database
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                type:
 *                  type: string
 *                  description: JSON type 
 *                  example: author
 *                id:
 *                  type: string
 *                  description: URL of Author
 *                  example: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *                authorId:
 *                  type: string 
 *                  description: UUID of Author 
 *                  example: 29c546d45f564a27871838825e3dbecb
 *                host: 
 *                  type: string
 *                  description: network the Author is from 
 *                  example: https://yoshi-connect.herokuapp.com/
 *                url: 
 *                  type: string
 *                  description: URL of Author 
 *                  example: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *                displayName:
 *                  type: string
 *                  description: username of Author (unique)
 *                  example: kc
 *                about: 
 *                  type: string
 *                  description: description about Author 
 *                  example: i am a code monkey
 *                pronouns:
 *                  type: string
 *                  description: pronouns the Author takes
 *                  example: she/her
 *                github:
 *                  type: string
 *                  description: GitHub linked to the Author
 *                  example: https://github.com/kezzayuno
 *                profileImage:
 *                  type: string
 *                  description: profile picture Author uses
 *                  example: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkIAAADIhkjhaDjkdHfkaSd
 */
router.get('/:authorId', async (req, res) => {
  const authorId = req.params.authorId;
  const [author, status] = await getAuthor(authorId);

  if (status == 404 || status == 500) { return res.sendStatus(status); }

  return res.json(author);
})

/**
 * @openapi
 * components:
 *   schemas:
 *     Author:
 *         type: object
 *         properties: 
 *           type:
 *             type: string
 *             description: JSON type 
 *           id:
 *             type: string
 *             description: URL of Author
 *           authorId:
 *             type: string 
 *             description: UUID of Author 
 *           host: 
 *             type: string
 *             description: network the Author is from 
 *           url: 
 *             type: string
 *             description: URL of Author 
 *           displayName:
 *             type: string
 *             description: username of Author (unique)
 *           email:
 *             type: string
 *             description: email of Author (unique)
 *           about: 
 *             type: string
 *             description: description about Author 
 *           pronouns:
 *             type: string
 *             description: pronouns the Author takes
 *           github:
 *             type: string
 *             description: GitHub linked to the Author
 *           profileImage:
 *             type: string
 *             description: profile picture Author uses
 *           admin:
 *             type: boolean
 *             description: dictates whether the Author is an admin or not
 * /authors/:authorId:
 *  post:
 *    summary: Updates an existing Author with authorId params
 *    tags:
 *      - author
 *    requestBody:
 *      content:
 *        application/x-wwwm-form-urlencoded:
 *          schema:
 *            $ref: '#/components/schemas/Author'
 *          example:
 *            type: author
 *            id: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *            authorId: 29c546d45f564a27871838825e3dbecb
 *            host: https://yoshi-connect.herokuapp.com/
 *            url: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *            displayName: kc
 *            email: ayuno@ualberta.ca
 *            about: i am a code monkey
 *            pronouns: she/her
 *            github: https://github.com/kezzayuno
 *            profileImage: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkIAAADIhkjhaDjkdHfkaSd
 *            admin: true
 *    parameters:
 *      - in: path
 *        name: authorId
 *        schema:
 *          type: string
 *        description: id of an Author
 *    responses:
 *      401:
 *        description: Unauthorized, Author does not have an associated token 
 *      400:
 *        description: Bad Request, type, authorId, host, username are incorrect
 *      200:
 *        description: OK, Author was succesfully sent, JSON sent with sanitized and updated Author
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                type:
 *                  type: string
 *                  description: JSON type 
 *                  example: author
 *                id:
 *                  type: string
 *                  description: URL of Author
 *                  example: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *                authorId:
 *                  type: string 
 *                  description: UUID of Author 
 *                  example: 29c546d45f564a27871838825e3dbecb
 *                host: 
 *                  type: string
 *                  description: network the Author is from 
 *                  example: https://yoshi-connect.herokuapp.com/
 *                url: 
 *                  type: string
 *                  description: URL of Author 
 *                  example: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *                displayName:
 *                  type: string
 *                  description: username of Author (unique)
 *                  example: kc123
 *                about: 
 *                  type: string
 *                  description: description about Author 
 *                  example: i am a code monkey 2.0
 *                email: 
 *                  type: string
 *                  description: email about Author 
 *                  example: ayuno123@ualberta.ca
 *                pronouns:
 *                  type: string
 *                  description: pronouns the Author takes
 *                  example: she/her
 *                github:
 *                  type: string
 *                  description: GitHub linked to the Author
 *                  example: https://github.com/kezzayuno
 *                profileImage:
 *                  type: string
 *                  description: profile picture Author uses
 *                  example: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkIAAADIhkjhaDjkdHfkaSd
 *      404:
 *        description: Not Found, Author was not found
 */
router.post('/:authorId', async (req, res) => {
  if (!req.cookies.token) { return res.sendStatus(401); }
  if (req.body.type !== 'author') { return res.sendStatus(400); }

  const authorId = req.body.id;
  const host = req.body.host;
  const username = req.body.displayName;
  const url = req.body.url;

  if (!authorId || !host || !username || !url) { return res.sendStatus(400); }

  const [author, status] = await updateAuthor(req.cookies.token, req.body)

  if (status == 200) { return res.json(author) }
  if (status == 404 || status == 401) { return res.sendStatus(status); }
})

/**
 * @openapi
 * /search/:username:
 *  post:
 *    summary: Searches for a list of names locally and remotely that match the searched username
 *    tags:
 *      - author
 *    parameters:
 *      - in: path
 *        name: username
 *        schema:
 *          type: string
 *        description: username of an Author
 *    responses:
 *      200:
 *        description: OK, successfully found a list of Authors matching username
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                type:
 *                  type: string
 *                  description: JSON type 
 *                  example: authors
 *                items: 
 *                  type: array
 *                  items: 
 *                    type: object
 *                  description: array of Authors fetch from database that are from local and remote servers (matching username)
 *                  example: 
 *                    - type: author
 *                      id: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *                      authorId: 29c546d45f564a27871838825e3dbecb
 *                      host: https://yoshi-connect.herokuapp.com/
 *                      displayName: kc
 *                      url: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *                      github: https://github.com/kezzayuno
 *                      profileImage: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkIAAADIhkjhaDjkdHfkaSd
 *                      about: i am a code monkey
 *                      pronouns: she/her
 *                    - type: author
 *                      id: https://yoshi-connect.herokuapp.com/authors/3ec2a2a0685445509a3ea1dd3093639f
 *                      authorId: 3ec2a2a0685445509a3ea1dd3093639f
 *                      host: https://yoshi-connect.herokuapp.com/
 *                      displayName: kc
 *                      url: https://yoshi-connect.herokuapp.com/authors/3ec2a2a0685445509a3ea1dd3093639f
 *                      github: https://github.com/Holy-Hero
 *                      profileImage: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkIAAADIhkjhaDjkdHfkaSd
 *                      about: i love hatsune miku
 *                      pronouns: he/him
 *      404:
 *        description: Not Found, Author was not found
 */
router.get('/search/:username', async (req, res) => {
  const username = req.params.username;
  let authors = []
  let localAuthor = await Author.findOne({username: username}).clone();
  if (localAuthor) { 
    authors.push({
      displayName: localAuthor.username,
      github: localAuthor.github,
      host: 'https://yoshi-connect.herokuapp.com/',
      id: 'https://yoshi-connect.herokuapp.com/authors/' + localAuthor._id,
      profileImage: localAuthor.profileImage,
      type: 'author',
      url: 'https://yoshi-connect.herokuapp.com/authors/' + localAuthor._id
    })
  }

  const outgoings = await OutgoingCredentials.find().clone();

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
            if (outgoings[i].url === 'https://bigger-yoshi.herokuapp.com/api') {
                var config = {
                  host: outgoings[i].url,
                  url: outgoings[i].url + '/authors/',
                  method: 'GET',
                  headers: {
                      'Authorization': auth,
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
          }
    
          await axios.request(config)
          .then( res => {
              let items = []
              if (outgoings[i].auth === 'userpass') {
                  items = res.data.results
              } else {
                  items = res.data.items
                  if (items === undefined) {
                    items = res.data.data
                  }
              }
              if (items !== undefined) {
                for (let j = 0; j < items.length; j++) {
                  if (items[j].displayName == username) {
                    authors.push(items[j]);
                  }
                }
              }
          })
          .catch( error => {
              console.log(error);
          })
      }
  }
  return res.json({
    "type": 'authors',
    "items": authors
  })

})

module.exports = router;
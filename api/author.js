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

// Router
const router = express.Router({mergeParams: true});

/**
 * @openapi
 * /authors:
 *  get:
 *    description: Fetches a paginated list of Authors (dictated by size and page queries)
 *    tags:
 *      - author
 *    responses:
 *      500:
 *        description: Internal Serevr Error -- unable to fetch Authors from database
 *      400:
 *        description: Bad Request -- incorrect paging requested from the user
 *      200: 
 *        description: OK -- successfully fetched and sanitized authors from the database 
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
 *    description: Fetches a specific Author using authorId params
 *    tags:
 *      - author
 *    responses:
 *      404:
 *        description: Not Found -- Authour was not found in the database
 *      500:
 *        description: Internal Server Error -- server experienced 'server failure'
 *      200: 
 *        description: OK -- successfully fetched and sanitized the Author from the database
 */
router.get('/:authorId', async (req, res) => {
  const authorId = req.params.authorId;
  const [author, status] = await getAuthor(authorId);

  if (status == 404 || status == 500) { return res.sendStatus(status); }

  return res.json(author);
})

/**
 * @openapi
 * /authors/:authorId:
 *  post:
 *    description: Updates an existing Author with authorId params
 *    tags:
 *      - author
 *    body: 
 *      - authorId: String
 *      - host: String
 *      - displayName: String
 *      - url: String
 *      - type: String
 *    responses:
 *      401:
 *        description: Unauthorized -- Author does not have an associated token 
 *      400:
 *        description: Bad Request -- type, authorId, host, username are incorrect
 *      200:
 *        description: OK -- Author was succesfully sent, JSON sent with sanitized and updated Author
 *      404:
 *        description: Not Found -- Author was not found
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

router.get('/search/:username', async (req, res) => {
  const username = req.params.username;
  const authors = await Author.find({username: username}).clone();
  if (!authors) { 
    return res.sendStatus(404)
  }

  return res.json({
    "type": 'authors',
    "items": authors
  })

})

module.exports = router;
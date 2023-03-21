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

// Router
const router = express.Router({mergeParams: true});

/**
 * @openapi
 * /authors:
 *  get:
 *    description: Fetches a paginated list of Authors (dictated by size and page queries)
 *    responses:
 *      500:
 *        description: Internal Serevr Error -- Getting authors failed server-side
 *      400:
 *        description: Bad Request -- Server cannot process getting authors
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
 *    description: Fetches a specific Author through authorId param
 *    responses:
 *      404:
 *        description: Not Found -- Authour was not found in the database
 *      500:
 *        description: Internal Server Error -- A server-side error occured when getting the author
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
 *    description: Updates an existing Author associated with authorId params
 *    body: {
 *      authorId, 
 *      host,
 *      displayName,
 *      url
 *    }
 *    responses:
 *      401:
 *        description: Unauthorized -- Author token is not authorized
 *      400:
 *        description: Bad Request -- Author body type was not processed
 *      400:
 *        description: Bad Request -- Author ID, host, username, or url did not match
 *      200:
 *        description: OK -- Author was succesfully sent, json file contains authorId, host, username, url
 *      404:
 *        description: Not Found -- Author was not found
 *      401:
 *        description: Unauthorized -- Authour is not authernticated
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

module.exports = router;
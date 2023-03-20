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
const { sendRequest, deleteRequest, getRequests, getRequest } = require('../routes/request');
const { checkExpiry } = require('../routes/auth');

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
 * /authors/:authorId/requests:
 *  get:
 *    description: <INSERT>
 *    responses:
 *      <INSERT>:
 *        description: <INSERT>
 */
router.get('/', async (req, res) => {
  if (!req.cookies || await checkExpiry(req.cookies.token)) { return res.sendStatus(401); }

  const authorId = req.params.authorId;
  await getRequests(authorId, res);
})

/**
 * @openapi
 * /authors/:authorId/requests/:foreignAuthorId:
 *  get:
 *    description: <INSERT>
 *    responses:
 *      <INSERT>:
 *        description: <INSERT>
 */
router.get('/:foreignAuthorId', async (req, res) => {
  const authorId = req.params.authorId;
  const foreignId = req.params.foreignAuthorId;

  await getRequest(authorId, foreignId, res);
})

/**
 * @openapi
 * /authors/:authorId/requests/:foreignAuthorId:
 *  put:
 *    description: <INSERT>
 *    responses:
 *      <INSERT>:
 *        description: <INSERT>
 */
router.put('/:foreignAuthorId', async (req, res) => {
  const authorId = req.params.authorId;
  const foreignId = req.params.foreignAuthorId;

  const request = await sendRequest(authorId, foreignId, res);

  return res.json({
    "type": request.type,
    "summary": request.summary,
    "actor": request.actor,
    "object": request.object
  })
})

/**
 * @openapi
 * /authors/:authorId/requests/:foreignAuthorId:
 *  delete:
 *    description: <INSERT>
 *    responses:
 *      <INSERT>:
 *        description: <INSERT>
 */
router.delete('/:foreignAuthorId', async (req, res) => {
  const authorId = req.params.authorId;
  const foreignId = req.params.foreignAuthorId;

  await deleteRequest(authorId, foreignId, res);
})

module.exports = router;
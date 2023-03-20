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
const { getFriends, isFriend } = require('../routes/friend');
const { checkExpiry } = require('../routes/auth');

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
 * /authors/:authorId/friends:
 *  get:
 *    description: <INSERT>
 *    responses:
 *      <INSERT>:
 *        description: <INSERT>
 */
router.get('/', async (req, res) => {
  const authorId = req.params.authorId;
  const friends = await getFriends(authorId);

  if (friends == 404) { return res.sendStatus(404); }

  sanitizedObjects = [];
  for(let i = 0; i < friends.length; i++){
    const friendId = friends[i];

    const friendProfile = await Author.findOne({_id: friendId}); 
    if (!friendProfile) 
      continue

      sanitizedObject = {
      "type": "author",
      "id" : process.env.DOMAIN_NAME + "authors/" + friendProfile._id,
      "host": process.env.DOMAIN_NAME,
      "displayname": friendProfile.username,
      "url":  process.env.DOMAIN_NAME + "authors/" + friendProfile._id,
      "github": "",
      "profileImage": "",
      "email": friendProfile.email,
      "about": friendProfile.about,
      "pronouns": friendProfile.pronouns
    }

    sanitizedObjects.push(sanitizedObject);
  }

  return res.json({
    type: "friends",
    items: sanitizedObjects
  });
})

/**
 * @openapi
 * /authors/:authorId/friends/:foreignId:
 *  post:
 *    description: <INSERT>
 *    responses:
 *      <INSERT>:
 *        description: <INSERT>
 */
router.post('/:foreignId', async (req, res) => {
  if (!req.cookies || await checkExpiry(req.cookies.token)) { return res.sendStatus(401) }

  const authorId = req.params.authorId;
  const foreignId = req.params.foreignId;

  await isFriend(authorId, foreignId, res);
})

/**
 * @openapi
 * /authors/:authorId/friends/:foreignId:
 *  get:
 *    description: <INSERT>
 *    responses:
 *      <INSERT>:
 *        description: <INSERT>
 */
router.get('/:foreignId', async (req, res) => {
  const authorId = req.params.authorId;
  const foreignId = req.params.foreignId;

  isFriend(authorId, foreignId);
})

module.exports = router;
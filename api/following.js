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
const { getFollowings, deleteFollowing } = require('../routes/friend');
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
 * /authors/:authorId/followings:
 *  get:
 *    summary: Fetches the followings list for Author associated with authorId
 *    tags:
 *      - following 
 *    parameters:
 *      - in: path
 *        name: authorId
 *        schema:
 *          type: string
 *        description: id of an Author
 *    responses:
 *      401:
 *        description: Unauthorized, no associated cookies or Login token expired 
 *      404: 
 *        description: Not Found, Author associated with authorId does not have a followings list 
 *      200: 
 *        description: OK, successfully fetches and sanitizes followings list associated with authorId 
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                type:
 *                  type: string
 *                  description: JSON type 
 *                  example: followings
 *                items: 
 *                  type: array
 *                  items: 
 *                    type: object
 *                  description: array of followings
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
  if (!req.cookies || await checkExpiry(req.cookies.token)) { return res.sendStatus(401) }

  const authorId = req.params.authorId;
  const followings = await getFollowings(authorId);

  if (followings == 404 || followings == undefined) { return res.sendStatus(404); }

  sanitizedObjects = [];
  for (let i = 0; i < followings.length; i++) {
    const following = followings[i];

    const followingProfile = await Author.findOne({_id: following.authorId}); 
    if (!followingProfile) 
      continue

      sanitizedObject = {
      "type": "author",
      "id" : process.env.DOMAIN_NAME + "authors/" + followingProfile._id,
      "host": process.env.DOMAIN_NAME,
      "displayname": followingProfile.username,
      "url":  process.env.DOMAIN_NAME + "authors/" + followingProfile._id,
      "github": "",
      "profileImage": "",
      "email": followingProfile.email,
      "about": followingProfile.about,
      "pronouns": followingProfile.pronouns
    }

    sanitizedObjects.push(sanitizedObject);
  }

  return res.json({
    type: "followings",
    items: sanitizedObjects
  });
})

/**
 * @openapi
 * /authors/:authorId/followings/:foreignAuthorId:
 *  get:
 *    summary: deletes a specific Author associated with foreignAuthorId contained in Author followings list associated with authorIdi
 *    tags:
 *      - following 
 *    parameters:
 *      - in: path
 *        name: authorId
 *        schema:
 *          type: string
 *        description: id of an Author
 *      - in: path
 *        name: foreignAuthorId
 *        schema:
 *          type: string
 *        description: id of an foreign Author
 *    responses:
 *      401:
 *        description: Unauthorized, no associated cookies or Login token expired 
 *      204: 
 *        description: No Content, following foreign Author was deleted from followings list associated with authorId 
 */
router.delete('/:foreignAuthorId', async (req, res) => {
  if (!req.cookies || await checkExpiry(req.cookies.token)) { return res.sendStatus(401) }

  const authorId = req.params.authorId;
  const foreignId = req.params.foreignAuthorId;

  const statusCode = await deleteFollowing(authorId, foreignId);

  return res.sendStatus(statusCode);
})

module.exports = router;
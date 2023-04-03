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
 *    summary: Fetches friends list associated with authorId 
 *    tags:
 *      - friend
 *    parameters:
 *      - in: path
 *        name: authorId
 *        schema:
 *          type: string
 *        description: id of an Author
 *    responses:
 *      404:
 *        description: Not Found, no friends list associated with authorId 
 *      200: 
 *        description: OK, fetches and sanitizes friends list successfully 
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                type:
 *                  type: string
 *                  description: JSON type 
 *                  example: friends
 *                items: 
 *                  type: array
 *                  items: 
 *                    type: object
 *                  description: array of friends
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
 *    summary: Checks if the Author associated with foreignId is true friends with Author associated with authorId 
 *    tags:
 *      - friend
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
 *      200: 
 *        description: OK, successfully checks the type of relation the foreign author has with author
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                type:
 *                  type: string
 *                  description: JSON type 
 *                  example: relation
 *                aId: 
 *                  type: string
 *                  description: actor url 
 *                  example: https://yoshi-connect.herokuapp.com/authors/f08d2d6579d5452ab282512d8cdd10d4
 *                actorId: 
 *                  type: string
 *                  description: UUID actor id
 *                  example: f08d2d6579d5452ab282512d8cdd10d4
 *                host: 
 *                  type: string
 *                  description: current host
 *                  example: https://yoshi-connect.herokuapp.com/
 *                oId: 
 *                  type: string
 *                  description: object url
 *                  example: https://yoshi-connect.herokuapp.com/authors/f25cd371afbb4775930fefa6ad8828c4
 *                objectId:
 *                  type: string
 *                  description: UUID object id
 *                  example: f25cd371afbb4775930fefa6ad8828c4
 *                status:
 *                  type: string
 *                  description: type of relationships (Friends, Follows, Strangers)
 *                  example: Friends
 *        
 */
router.post('/:foreignId', async (req, res) => {
  if (!req.cookies || await checkExpiry(req.cookies.token)) { return res.sendStatus(401) }

  const authorId = req.params.authorId;
  const foreignId = req.params.foreignId;

  await isFriend(req.body.isLocal, authorId, foreignId, res);
})

module.exports = router;
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
const { getFollowers, addFollower, deleteFollower } = require('../routes/friend');
const { Author} = require('../scheme/author');
const { checkExpiry } = require('../routes/auth');

// OpenAPI
const {options} = require('../openAPI/options.js');

// Swaggerio
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require('swagger-jsdoc');
const openapiSpecification = swaggerJsdoc(options);

// Router Setup
const express = require('express'); 
const { OutgoingCredentials } = require('../scheme/server');
const axios = require('axios');

// Router
const router = express.Router({mergeParams: true});

/**
 * @openapi
 * /authors/:authorId/followers:
 *  get:
 *    summary: Fetches the followers for a specific Author using the authorId params
 *    tags:
 *      - follower
 *    parameters:
 *      - in: path
 *        name: authorId
 *        schema:
 *          type: string
 *        description: id of an Author
 *    responses:
 *      404:
 *        description: Not Found, could not find the specific Author
 *      200:
 *        description: OK, successfully fetches and sanitizes followers
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                type:
 *                  type: string
 *                  description: JSON type 
 *                  example: followers
 *                items: 
 *                  type: array
 *                  items: 
 *                    type: object
 *                  description: array of followers
 *                  example: 
 *                    - _id: 895fa44f67be488d9123516e5a9b6285
 *                      id: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *                      authorId: bddddc62-a6d6-4f79-8a7d-4249719e1e61
 *                      host: https://yoshi-connect.herokuapp.com/
 *                      displayName: hari
 *                      github: ""
 *                      profileImage: ""
 *                    - type: author
 *                      id: https://yoshi-connect.herokuapp.com/authors/3ec2a2a0685445509a3ea1dd3093639f
 *                      host: https://yoshi-connect.herokuapp.com/
 *                      displayName: allan
 *                      url: https://yoshi-connect.herokuapp.com/authors/3ec2a2a0685445509a3ea1dd3093639f
 *                      github: https://github.com/Holy-Hero
 *                      profileImage: https://media.tenor.com/lFoIvXgBojsAAAAC/xayah-eye-roll.gif
 *                      about: i love hatsune miku
 *                      pronouns: he/him
 */
router.get('/', async (req, res) => {
  
  const authorId = req.params.authorId;
  const followers = await getFollowers(authorId);

  if (followers == 404) { return res.send(404); }

  sanitizedObjects = [];
  for(let i = 0; i < followers.length; i++){
    const follower = followers[i];

    const followerProfile = await Author.findOne({_id: follower.authorId}); 
    if (!followerProfile) {
      sanitizedObjects.push(follower);
    } else {
      sanitizedObject = {
        "type": "author",
        "id" : process.env.DOMAIN_NAME + "authors/" + followerProfile._id,
        "host": process.env.DOMAIN_NAME,
        "displayname": followerProfile.username,
        "url":  process.env.DOMAIN_NAME + "authors/" + followerProfile._id,
        "github": "",
        "profileImage": "",
        "email": followerProfile.email,
        "about": followerProfile.about,
        "pronouns": followerProfile.pronouns
      }
      sanitizedObjects.push(sanitizedObject);
    }
  }

  return res.json({
    type: "followers",
    items: sanitizedObjects
  });
})

/**
 * @openapi
 * /authors/:authorId/followers/:foreignAuthorId:
 *  get:
 *    summary: Fetches a specific Author using foreignAuthorId params associated by authorId params 
 *    tags:
 *      - follower
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
 *        description: id of the foreign Author
 *    responses:
 *      404:
 *        description: Not Found, could not find author associated to authorId
 *      200:
 *        description: OK, successfully fetches a specific follower
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
 *                  description: authorId of follower
 *                  example: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *                host: 
 *                  type: string
 *                  description: host of follower
 *                  example: https://yoshi-connect.herokuapp.com
 *                displayname:
 *                  type: string
 *                  description: username of follower
 *                  example: kc
 *                url:
 *                  type: string
 *                  description: URL of follower
 *                  example: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *                github:
 *                  type: string
 *                  description: associated GitHub of follower
 *                  example: https://github.com/kezzayuno
 *                profileImage:
 *                  type: string
 *                  description: profile picture of follower
 *                  example: https://media.tenor.com/lFoIvXgBojsAAAAC/xayah-eye-roll.gif
 *                pronouns: 
 *                  type: string
 *                  description: pronouns for a follower
 *                  example: she/her
 */
router.get('/:foreignAuthorId', async (req, res) => {
  const authorId = req.params.authorId;
  const foreignId = req.params.foreignAuthorId;
  let foreign = '';

  const followers = await getFollowers(authorId);

  if (!followers) {
    return res.json({ "is_following": false });
  }

  const followerProfile = await Author.findOne({_id: foreignId}); 
  if (followerProfile) {
    foreign = {
      "type": "author",
      "id" : process.env.DOMAIN_NAME + "authors/" + followerProfile._id,
      "host": process.env.DOMAIN_NAME,
      "displayName": followerProfile.username,
      "url":  process.env.DOMAIN_NAME + "authors/" + followerProfile._id,
      "github": "",
      "profileImage": "",
      "about": followerProfile.about,
      "pronouns": followerProfile.pronouns
    };
  } else {
    // Must be remote 
    const outgoings = await OutgoingCredentials.find().clone();
    for (let i = 0; i < outgoings.length; i++) {
        if (outgoings[i].allowed) {    
            let config = {
                host: outgoings[i].url,
                url: outgoings[i].url + '/authors/' + foreignId,
                method: "GET",
                headers:{
                    "Authorization": outgoings[i].auth,
                    'Content-Type': 'application/json'
                }
            }
            await axios.request(config)
            .then((res) => { 
                foreign = {
                  "type": "author",
                  "id" : res.data.id,
                  "host": res.data.host,
                  "displayName": res.data.displayName,
                  "url":  res.data.url,
                  "github": res.data.github,
                  "profileImage": res.data.profileImage
                };
            })
            .catch((err) => { console.log('Author does not belong in server.') })       
        }
    }
  }

  for (let i = 0; i < followers.length; i++) {
    const follower = followers[i];
    if (follower.authorId == foreignId) {
      return res.json({...foreign, "is_following": true})
    }
  }
  return res.json({ "is_following": false });
})

/**
 * @openapi
 * components:
 *   schemas:
 *     follower:
 *       properties:
 *         type:
 *            type: string
 *            description: follow
 *         actor:
 *           type: object
 *           description: author object, author who is going to be a follower
 *           properties:
 *             type:
 *               type: string
 *               description: author
 *             id: 
 *               type: string
 *             url: 
 *               type: string
 *             host: 
 *               type: string
 *             displayName: 
 *               type: string
 *             github:
 *               type: string
 *             profileImage: 
 *               type: string
 *         object:
 *           type: object
 *           description: author object, author you want to follow
 *           properties:
 *             type:
 *               type: string
 *             id: 
 *               type: string
 *             url: 
 *               type: string
 *             host: 
 *               type: string
 *             displayName: 
 *               type: string
 *             github:
 *               type: string
 *             profileImage: 
 *               type: string
 * /authors/:authorId/followers/:foreignAuthorId:
 *  put:
 *    summary: Adds a new follower associated with foreignAuthorId for the Author associated with authorId
 *    tags:
 *      - follower
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
 *        description: id of the foreign Author
 *    requestBody:
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            $ref: '#/components/schemas/follower'
 *          example:
 *            type: follower
 *            actor:
 *              type: author
 *              id: https://yoshi-connect.herokuapp.com/authors/3ec2a2a0685445509a3ea1dd3093639f
 *              url: https://yoshi-connect.herokuapp.com/authors/3ec2a2a0685445509a3ea1dd3093639f
 *              host: https://yoshi-connect.herokuapp.com/
 *              displayName: allan
 *              github: https://github.com/Holy-Hero
 *              profileImage: https://media.tenor.com/lFoIvXgBojsAAAAC/xayah-eye-roll.gif
 *            object:
 *              type: author
 *              id: https://yoshi-connect.herokuapp.com/authors/3ec2a2a0685445509a3ea1dd3093639e
 *              url: https://yoshi-connect.herokuapp.com/authors/3ec2a2a0685445509a3ea1dd3093639e
 *              host: https://yoshi-connect.herokuapp.com/
 *              displayName: allan2
 *              github: https://github.com/Holy-Hero2
 *              profileImage: https://media.tenor.com/lFoIvXgBojsAAAAC/xayah-eye-roll.gif
 *    responses:
 *      401:
 *        description: Unauthorized, no associated cookies, Login token had expired, authorId was not authenticated 
 *      404: 
 *        description: Not Found, unable to find a request object from the foreignAuthorId to the authorId
 *      200: 
 *        description: OK, successfully added follower to the follower document for Author associated with authorId
 */
router.put('/:foreignAuthorId', async (req, res) => {
  const authorId = req.params.authorId;
  const foreignId = req.params.foreignAuthorId;

  const follower = await addFollower(req.cookies.token, authorId, foreignId, req.body, req, res);

  if (follower == 400 || follower == 404 || follower == 401) {
    return res.sendStatus(follower);
  }
})

/**
 * @openapi
 * /authors/:authorId/followers/:foreignAuthorId:
 *  delete:
 *    summary: deleting follower associated with foreignAuthorId from Author followers list associated authorId 
 *    tags:
 *      - follower
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
 *        description: id of the foreign Author
 *    responses:
 *      401:
 *        description: Unauthorized, no associated cookies or Login token has expired 
 *      400: 
 *        description: Bad Request, no type specified or req.body.type != 'follower' 
 *      204: 
 *        description: No Content, follower was successfully deleted from Author follower list 
 */
router.delete('/:foreignAuthorId', async (req, res) => {
  if (!req.cookies || await checkExpiry(req.cookies.token)) { return res.sendStatus(401) }

  const authorId = req.params.authorId;
  const foreignId = req.params.foreignAuthorId;

  const statusCode = await deleteFollower(authorId, foreignId);

  return res.sendStatus(statusCode);
})

module.exports = router;
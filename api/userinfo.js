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
const { getUserInfo } = require('../routes/userinfo');

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
 * /userinfo:
 *  get:
 *    description: Fetches the Author's attributes through the use of the cookie token 
 *    tags:
 *      - userinfo
 *    responses:
 *      401:
 *        description: Unauthorized, Author token is not authenticated
 *      200:
 *        description: OK, Author was fetched from database, Returns the sanitized Author, Returns JSON with Author's attributes
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
 *                  description: authorId
 *                  example: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *                host: 
 *                  type: string
 *                  description: host of Author belongs to
 *                  example: https://yoshi-connect.herokuapp.com
 *                displayname:
 *                  type: string
 *                  description: username 
 *                  example: kc
 *                url:
 *                  type: string
 *                  description: URL of author
 *                  example: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *                github:
 *                  type: string
 *                  description: associated GitHub of author
 *                  example: https://github.com/kezzayuno
 *                profileImage:
 *                  type: string
 *                  description: profile picture of author
 *                  example: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkIAAADIhkjhaDjkdHfkaSd
 *                pronouns: 
 *                  type: string
 *                  description: pronouns for a author
 *                  example: she/her
 *      500:
 *        description: Internal Server Error, Unable to fetch Author from  database
 *      404:
 *        description: Not Found, Authour was not found
 */
router.get('/', async (req,res) => {
    if (!req.cookies.token) { return res.sendStatus(401); }

    const [userinfo, status] = await getUserInfo(req.cookies.token);

    if (status != 200) { return res.sendStatus(status); }

    return res.json(userinfo);
})

module.exports = router;
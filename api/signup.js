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
const { registerAuthor } = require('../routes/author');

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
 * /signup:
 *  post:
 *    description: Registers an Author in YoshiConnect by sending the document to be enabled or disabled by an Admin Author
 *    tags:
 *      - signup
 *    responses:
 *      400:
 *        description: Bad Request, Username is already taken, no 'username', 'email', or 'password' was given, or invalid email
 *      500:
 *        description: Internal Server Error, Unable to save object in database
 *      200:
 *        description: OK, Author regristration was successful, authour added to the database
 */
router.post('/', async (req, res) => { await registerAuthor(req, res); })

module.exports = router;
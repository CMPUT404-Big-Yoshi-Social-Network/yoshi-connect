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
const { authAuthor } = require('../routes/auth');

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
 * /login:
 *  post:
 *    description: Authenticates Author 
 *    responses:
 *      400:
 *        description: Bad Request -- did not specify username and/or password
 * 		404: 
 * 		  description: Not Found -- could not find an Author to authenticate 
 * 		500: 
 * 		  description: Internal Server Error -- unable to delete currently existing Login document (unable to update the Login document)
 * 		500: 
 * 		  description: Internal Server Error -- password from request and encrypted password in database not equal to each other 
 * 		500: 
 * 		  description: Internal Server Error -- unable to save Login document for newly authenticated Author 
 * 		403: 
 * 		  description: Forbidden -- unable to Login as user as user is trying to login as an admin but is not an admin 
 */
router.post('/', async (req, res) => { await authAuthor(req, res); })

module.exports = router;
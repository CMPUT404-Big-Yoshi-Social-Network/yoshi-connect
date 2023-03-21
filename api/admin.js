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
const { authAuthor, removeLogin, checkExpiry, checkAdmin } = require('../routes/auth');
const { addAuthor, modifyAuthor, deleteAuthor } = require('../routes/admin');

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
 * /admin: 
 *  post:
 *    description: Authenticates an potential Author for YoshiConnect
 *    responses:
 *      400:
 *        description: Bad Request -- Invalid username or password
 *      400:
 *        description: Bad Request -- Author was not found in the database
 *      500:
 *        description: Internal Server Error -- deleting login token encountered a server-side error 
 *      403:
 *        description: Forbidden -- Not admin author was denied access
 *      200:
 *        description: OK -- Login as author was successful and cached
 *      500:
 *        description: Internal Server Error -- 
 *      500:
 *        description: Internal Server Error --
 */
router.post('/', async (req, res) => { await authAuthor(req, res); })

/**
 * @openapi
 * /admin/dashboard:
 *  get:
 *    description: Verifies Author has attribute admin=true then redirects the Author to the Admin Dashboard if verified
 *    responses:
 *      403:
 *        description: Forbidden -- If admin is not authenticated, access is not granted
 *      401:
 *        description: Unauthorized -- Admin token expired and was not granted authorizatiin 
 *      200:
 *        description: OK -- Admin was successfully authenticated
 */
router.get('/dashboard', async (req, res) => {
  if(!(await checkAdmin(req, res))){ return res.sendStatus(403) }
  if(!req.cookies || await checkExpiry(req.cookies.token)){ return res.sendStatus(401) }
  return res.sendStatus(200)
})

/**
 * @openapi
 * /admin/dashboard:
 *  post:
 *    description: Removes the Login document (associated token) to log out the Admin 
 *    responses:
 *      500:
 *        description: Internal Server Error -- Logining in with token failed server-side
 *      200:
 *        description: OK -- Login token was successfully deleted 
 *      401:
 *        description: Unauthorized -- Token is undefined, login token never existed and user access is unauthorized  
 */
router.post('/dashboard', async (req, res) => { removeLogin(req, res); })

/**
 * @openapi
 * /admin/dashboard:
 *  delete:
 *    description: Deletes an Author from YoshiConnect database 
 *    responses:
 *      404:
 *        description: Not Found -- Author was not found
 *      500:
 *        description: Internal Server Error -- Loging author in failed server-side
 *      204:
 *        description: No Content -- No author data found, author was successfully deleted
 */
router.delete('/dashboard', (req, res) => { deleteAuthor(req, res); })

/**
 * @openapi
 * /admin/dashboard:
 *  put:
 *    description: Either Adds an Author to YoshiConnect database or Updates an Author's attributes 
 *      - ADD: Requests an add smth to add author to database
 *      - MODIFY: Requests a modify smth to modify existing author in database
 *    responses:
 *      <INSERT>:
 *        description: <INSERT>
 */
router.put('/dashboard', (req, res) => {
  if (req.body.status == 'Add') {
    addAuthor(req, res);
  } else if (req.body.status == 'Modify') {
    modifyAuthor(req, res);
  }
})

module.exports = router;
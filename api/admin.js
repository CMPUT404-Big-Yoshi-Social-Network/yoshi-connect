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
const { addAuthor, modifyAuthor, deleteAuthor, allowAuthor } = require('../routes/admin');

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
 *    summary: Authenticates a potential Author for YoshiConnect
 *    tags:
 *      - admin
 *    responses:
 *      400:
 *        description: Bad Request -- Invalid username or password or author does not exist
 *      500:
 *        description: Internal Server Error -- Unable to authenticate Author or Unable to delete login token from database or password is incorrect
 *      403:
 *        description: Forbidden -- Author was not an admin
 *      200:
 *        description: OK -- Login as author was successful and cached
 */
router.post('/', async (req, res) => { await authAuthor(req, res); })

/**
 * @openapi
 * /admin/dashboard:
 *  get:
 *    summary: Verifies Author has attribute admin=true then redirects the Author to the Admin Dashboard if verified
 *    tags:
 *      - admin
 *    responses:
 *      403:
 *        description: Forbidden -- if Admin is not authenticated, access is not granted
 *      401:
 *        description: Unauthorized -- Admin token expired and was not granted authorization 
 *      200:
 *        description: OK -- admin was successfully authenticated
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
 *    summary: Removes the Login document (associated token) to log out the Admin 
 *    tags:
 *      - admin
 *    responses:
 *      500:
 *        description: Internal Server Error -- deleting Login document was unsuccessful 
 *      200:
 *        description: OK -- Login document was successfully deleted 
 *      401:
 *        description: Unauthorized -- Token is undefined, Login document never existed and user access is unauthorized  
 */
router.post('/dashboard', async (req, res) => { removeLogin(req, res); })

/**
 * @openapi
 * /admin/dashboard:
 *  delete:
 *    summary: Deletes an Author from YoshiConnect database 
 *    tags:
 *      - admin
 *    responses:
 *      404:
 *        description: Not Found -- Author was not found
 *      500:
 *        description: Internal Server Error -- deleting Login document for Author was unsuccessful
 *      204:
 *        description: No Content -- No Author data found, Author was successfully deleted
 */
router.delete('/dashboard', (req, res) => { deleteAuthor(req, res); })

/**
 * @openapi
 * /admin/dashboard:
 *  put:
 *    summary: Adds an Author to YoshiConnect database or updates an Author's attributes
 *    tags:
 *      - admin
 *    responses:
 *      400:
 *        description: Bad Request -- Author already exists, username and/or password taken, Admin did not fill all cells (username, password, email)
 *      500: 
 *        description: Internal Server Error -- unable to save the Author into the database, unable to find Login document for Author
 *      404: 
 *        description: Not Found -- cannot find an Author to modify 
 */
router.put('/dashboard', (req, res) => {
  if (req.body.status == 'Add') {
    addAuthor(req, res);
  } else if (req.body.status == 'Modify') {
    modifyAuthor(req, res);
  } else {
    console.log('Debug: Enabling / Disabling Author')
    allowAuthor(req, res);
  }
})

module.exports = router;
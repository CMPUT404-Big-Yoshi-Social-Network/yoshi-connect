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
 *      <INSERT>:
 *        description: <INSERT>
 */
router.post('/', async (req, res) => { await authAuthor(req, res); })

/**
 * @openapi
 * /admin/dashboard:
 *  get:
 *    description: Verifies Author has attribute admin=true then redirects the Author to the Admin Dashboard if verified
 *    responses:
 *      <INSERT>:
 *        description: <INSERT>
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
 *      <INSERT>:
 *        description: <INSERT>
 */
router.post('/dashboard', async (req, res) => { removeLogin(req, res); })

/**
 * @openapi
 * /admin/dashboard:
 *  delete:
 *    description: Deletes an Author from YoshiConnect database 
 *    responses:
 *      <INSERT>:
 *        description: <INSERT>
 */
router.delete('/dashboard', (req, res) => { deleteAuthor(req, res); })

/**
 * @openapi
 * /admin/dashboard:
 *  put:
 *    description: Either Adds an Author to YoshiConnect database or Updates an Author's attributes 
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
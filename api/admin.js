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
 *        description: Bad Request, Invalid username or password or author does not exist
 *      500:
 *        description: Internal Server Error, Unable to authenticate Author or Unable to delete login token from database or password is incorrect
 *      403:
 *        description: Forbidden, Author was not an admin
 *      200:
 *        description: OK, Login as author was successful and cached
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
 *        description: Forbidden, if Admin is not authenticated, access is not granted
 *      401:
 *        description: Unauthorized, Admin token expired and was not granted authorization 
 *      200:
 *        description: OK, Admin was successfully authenticated
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
 *        description: Internal Server Error, deleting Login document was unsuccessful 
 *      200:
 *        description: OK, Login document was successfully deleted 
 *      401:
 *        description: Unauthorized, token is undefined, Login document never existed and user access is unauthorized  
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
 *        description: Not Found, Author was not found
 *      500:
 *        description: Internal Server Error, deleting Login document for Author was unsuccessful
 *      204:
 *        description: No Content, No Author found, Author was successfully deleted
 */
router.delete('/dashboard', (req, res) => { deleteAuthor(req, res); })

/**
 * @openapi
 * components:
 *   schemas:
 *     NewAuthor:
 *         type: object
 *         properties: 
 *           status: 
 *             type: string
 *             description: type of request
 *           username: 
 *             type: string
 *             description: username of Author
 *           email:
 *             type: string
 *             description: email of Author
 *           password:
 *             type: string
 *             description: password of Author
 *     ModifyAuthor:
 *         type: object
 *         properties: 
 *           status: 
 *             type: string
 *             description: type of request
 *           newUsername: 
 *             type: string
 *             description: new username of Author
 *           newEmail:
 *             type: string
 *             description: new email of Author
 *           newPassword:
 *             type: string
 *             description: new password of Author
 *           newAbout:
 *             type: string
 *             description: new about of Author
 *           newPronouns:
 *             type: string
 *             description: new pronouns of Author
 *           newAdmin:
 *             type: boolean
 *             description: enabling or disabling of Author admin
 *           authorId:
 *             type: string
 *             description: UUID of author
 *     Author:
 *         type: object
 *         properties: 
 *           type:
 *             type: string
 *             description: JSON type 
 *           id:
 *             type: string
 *             description: URL of Author
 *           authorId:
 *             type: string 
 *             description: UUID of Author 
 *           host: 
 *             type: string
 *             description: network the Author is from 
 *           url: 
 *             type: string
 *             description: URL of Author 
 *           displayName:
 *             type: string
 *             description: username of Author (unique)
 *           email:
 *             type: string
 *             description: email of Author (unique)
 *           about: 
 *             type: string
 *             description: description about Author 
 *           pronouns:
 *             type: string
 *             description: pronouns the Author takes
 *           github:
 *             type: string
 *             description: GitHub linked to the Author
 *           profileImage:
 *             type: string
 *             description: profile picture Author uses
 * /admin/dashboard:
 *  put:
 *    summary: Adds an Author to YoshiConnect database or updates an Author's attributes
 *    tags:
 *      - admin
 *    requestBody:
 *      content:
 *        application/x-wwwm-form-urlencoded:
 *          schema:
 *            oneOf:
 *              - $ref: '#/components/schemas/NewAuthor'
 *              - $ref: '#/components/schemas/ModifyAuthor'
 *          examples:
 *             NewAuthor:
 *               value:
 *                 status: Add
 *                 username: kc
 *                 email: ayuno@ualberta.ca
 *                 password: 123
 *             ModifyAuthor:
 *               value:
 *                 status: Modify
 *                 newUsername: kc123
 *                 newEmail: ayuno123@ualberta.ca
 *                 newPassword: 123456
 *                 newAbout: i am a bad monkey coder
 *                 newPronouns: they/them
 *                 newAdmin: false
 *                 authorId: 29c546d45f564a27871838825e3dbecb
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Author'
 *          example:
 *            type: author
 *            id: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *            authorId: 29c546d45f564a27871838825e3dbecb
 *            host: https://yoshi-connect.herokuapp.com/
 *            url: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *            displayName: kc
 *            email: ayuno@ualberta.ca
 *            about: i am a code monkey
 *            pronouns: she/her
 *            github: https://github.com/kezzayuno
 *            profileImage: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkIAAADIhkjhaDjkdHfkaSd
 *    responses:
 *      200: 
 *        description: OK, Author successfully added, modified, or enabled / disabled 
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
 *                  description: URL of Author
 *                  example: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *                authorId:
 *                  type: string 
 *                  description: UUID of Author 
 *                  example: 29c546d45f564a27871838825e3dbecb
 *                host: 
 *                  type: string
 *                  description: network the Author is from 
 *                  example: https://yoshi-connect.herokuapp.com/
 *                url: 
 *                  type: string
 *                  description: URL of Author 
 *                  example: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *                displayName:
 *                  type: string
 *                  description: username of Author (unique)
 *                  example: kc
 *                email:
 *                  type: string
 *                  description: email of Author (unique)
 *                  example: ayuno@ualberta.ca
 *                about: 
 *                  type: string
 *                  description: description about Author 
 *                  example: i am a code monkey
 *                pronouns:
 *                  type: string
 *                  description: pronouns the Author takes
 *                  example: she/her
 *                github:
 *                  type: string
 *                  description: GitHub linked to the Author
 *                  example: https://github.com/kezzayuno
 *                profileImage:
 *                  type: string
 *                  description: profile picture Author uses
 *                  example: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkIAAADIhkjhaDjkdHfkaSd
 *                admin: 
 *                  type: boolean
 *                  description: dictates whether the Author is an admin (true) or not (false)
 *                  example: true
 *      400:
 *        description: Bad Request, Author already exists, username and/or password taken, Admin did not fill all cells (username, password, email)
 *      500: 
 *        description: Internal Server Error, unable to save the Author into the database, unable to find Login document for Author
 *      404: 
 *        description: Not Found, cannot find an Author to modify 
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
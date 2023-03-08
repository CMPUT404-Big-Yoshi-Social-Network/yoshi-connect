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

// Router Setup
const express = require('express'); 

// Router
const router = express.Router();

/**
 * @openapi
 * /api/login:
 *  post:
 *    description: Login url, so you can authenticate locally with the server
 *    responses:
 *      200:
 *        description: Successfully created an account
 *        headers:
 *         Set-Cookie:
 *            schema:
 *              type: string
 *              description: This token identifies you as being logged in and allows you to perform other api calls
 *              example: token=QV1hAYUZU5Qu2dkrP4peLN
 *      400:
 *        description: Unsuccessful if: 
 *          - User does not fill in both the password and username 
 *          - Account the user inputted does not exist 
 *      403:
 *        description: Unsuccessful if the user tries to login as an Admin in the Admin Login Webpage
 *      500: 
 *        description: Unsuccessful if:
 *          - Server is unable to delete existing token (i.e., refresh the token)
 *          - Server is unable to save the new token 
 *          - Hashed Password and the Password provided by the user is not equal 
 */
router.post('/', async (req, res) => {
  console.log('Debug: Login as Author')
  await authAuthor(req, res);
})

module.exports = router;
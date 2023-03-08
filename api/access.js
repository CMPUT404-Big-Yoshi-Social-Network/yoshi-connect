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
const { authAuthor } = require('./routes/auth');
const { registerAuthor } = require('./routes/author');

/**
 * @openapi
 * /api/signup:
 *  post:
 *    security:
 *      - loginToken: []
 *    description: Signup url. Allows creation of an account and automatically logins to this new account. 
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
 *        description: NEEDS TO BE REFACTORED Signup not possible, username, is already taken, field missing, etc.
 */
app.post('/api/signup', async (req, res) => {
  console.log('Debug: Signing up as an author');
  await registerAuthor(req, res);
})

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
 *        description: NEEDS TO BE REFACTORED Login not possible. Failed due to incorrect username or password. 
 */
app.post('/api/login', async (req, res) => {
  console.log('Debug: Login as Author')
  await authAuthor(req, res);
})
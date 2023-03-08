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
const { getInbox, postInbox, deleteInbox} = require('./routes/inbox')

/**
 * @openapi
 * /server/authors/:author_id/inbox:
 *  get:
 *    description: Gets the Author's Inbox
 *    responses:
 *      200:
 *        description: If the server finds an Inbox for the specified Author
 */
app.get('/server/authors/:author_id/inbox', async (req, res) => {
  console.log('Debug: Getting an authors inbox');
  await getInbox(req, res);
})

/**
 * @openapi
 * /server/authors/:author_id/inbox:
 *  get:
 *    description: Adds a Post, Follow, Comment, or Like to the Inbox of an Author
 *    responses:
 *      200:
 *        description: If the server successfully adds either a Post, Follow, Comment, or Like to the Author's Inbox
 */
app.post('/server/authors/:author_id/inbox', async (req, res) => {
  await postInbox(req, res);
})

/**
 * @openapi
 * /server/authors/:author_id/inbox:
 *  get:
 *    description: Deletes the Inbox
 *    responses:
 *      200:
 *        description: If the server finds an Inbox for the specified Author
 */
app.delete('/server/authors/:author_id/inbox', async (req, res) => {
  console.log("delete inbox")
  await deleteInbox(req, res);
})
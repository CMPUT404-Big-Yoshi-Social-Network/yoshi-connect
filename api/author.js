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
const { getAuthor, apiUpdateAuthor, getAuthors } = require('./routes/author');

/**
 * @openapi
 * /api/authors:
 *  get:
 *    description: Get a list of authors, paginated. by default it's page 1 with size 1. Currently pages are broken
 *    responses:
 *      200:
 *        description: A list of authors
 */
app.get('/api/authors', async (req, res) => {
  const page = req.query.page;
  const size = req.query.size;
  if(page == undefined)
    page = 1;
  if(size == undefined)
    size = 5;
  const sanitizedAuthors = await getAuthors(page, size);

  return res.json({
    "type": "authors",
    "items": [sanitizedAuthors]
  });
})

/**
 * @openapi
 * /api/authors/{authorId}:
 *  get:
 *    description: Fetchs a single Author object from the database and sends it back as a JSON object
 *    responses:
 *      404:
 *        description: Returns Status 404 when an Author does not exist 
 *      500:
 *        description: Returns Status 500 when the server is unable to retrieve the Author from the database
 */
app.get('/api/authors/:authorId', async (req, res) => {
  if(req.params.authorId == undefined)
    return res.sendStatus(404);

  let author = await getAuthor(req.params.authorId);

  if(author === 404)
    return res.sendStatus(404);

  if(author === 500)
    return res.sendStatus(500);

  return res.json({
    "type": "author",
    "id" : author._id,
    "host": process.env.DOMAIN_NAME,
    "displayname": author.username,
    "url":  process.env.DOMAIN_NAME + "users/" + author._id,
    "github": "",
    "profileImage": "",
    "email": author.email, 
    "about": author.about,
    "pronouns": author.pronouns
  });
})

/**
 * @openapi
 * /api/authors/{authorId}:
 *  post:
 *    description: Updates the Author objects attributes
 *    responses:
 *      404:
 *        description: Returns Status 404 when the cookies don't exist
 *      400:
 *        description: Returns Status 400 when the body type doesn't match the author 
 *      400:
 *        description: Returns Status 400 when the author ID, host, nor username are valid 
 */
app.post('/api/authors/:authorId', async (req, res) => {
  if(!req.cookies["token"])
    return res.sendStatus(401);
  if(req.body.type !== 'author')
    return res.sendStatus(400);

  const authorId = req.body.id;
  const host = req.body.host;
  const username = req.body.displayName;

  if(!authorId || !host || !username)
    return res.sendStatus(400);

  return res.sendStatus(await apiUpdateAuthor(req.cookies["token"], req.body));
})
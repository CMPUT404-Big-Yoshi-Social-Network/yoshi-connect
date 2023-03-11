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
const { sendRequest, apideleteRequest, getRequests, getRequest } = require('./routes/request');
const { checkExpiry } = require('../routes/auth');

/**
 * @openapi
 * /api/authors/{authorId}/requests:
 *  put:
 *    description: Saves the Request for the Foreign Author from the Author into the database 
 *    responses:
 *      200:
 *        description: Returns the JSON object representing the Request  
 */
app.get('/', async (req, res) => {
  if ((await checkExpiry(req, res))) { return res.sendStatus(401) }
  const authorId = req.params.authorId;

  const requests = await getRequests(authorId);

  return res.json({
    type: "requests",
    items: requests
  });
})

/**
 * @openapi
 * /api/authors/{authorId}/requests/{foreignAuthorId}:
 *  put:
 *    description: Saves the Request for the Foreign Author from the Author into the database 
 *    responses:
 *      200:
 *        description: Returns the JSON object representing the Request  
 */
app.get('/:foreignAuthorId', async (req, res) => {
  const authorId = req.params.authorId;
  const foreignId = req.params.foreignAuthorId;

  await getRequest(authorId, foreignId);
})

/**
 * @openapi
 * /api/authors/{authorId}/requests/{foreignAuthorId}:
 *  put:
 *    description: Saves the Request for the Foreign Author from the Author into the database 
 *    responses:
 *      200:
 *        description: Returns the JSON object representing the Request  
 */
app.put('/:foreignAuthorId', async (req, res) => {
  const authorId = req.params.authorId;
  const foreignId = req.params.foreignAuthorId;

  const request = await sendRequest(authorId, foreignId, res);

  return res.json({
    "type": request.type,
    "summary": request.summary,
    "actor": request.actor,
    "object": request.object
  })
})

/**
 * @openapi
 * /api/authors/{authorId}/requests/{foreignAuthorId}:
 *  delete:
 *    description: Deletes a Request made by the Author  to Foreign Author
 *    responses:
 *     200:
 *        description: Returns the JSON object representing the Request 
 */
app.delete('/api/authors/:authorId/requests/:foreignAuthorId', async (req, res) => {
  const authorId = req.params.authorId;
  const foreignId = req.params.foreignAuthorId;

  const request = await apideleteRequest(authorId, foreignId, res);

  return res.json({
    "type": request.type,
    "summary": request.summary,
    "actor": request.actor,
    "object": request.object
  })
})
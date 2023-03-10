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
const { getFriends, isFriend } = require('../routes/friend');

/**
 * @openapi
 * /api/authors/{authorId}/friends:
 *  get:
 *    description: Gets the author's followers and friends as objects from the database and sends it back as a JSON object
 *    responses:
 *      404:
 *        description: Returns Status 404 when there are no existing followers or friends
 */
app.get('/', async (req, res) => {
  const authorId = req.params.authorId;

  const friends = await getFriends(authorId);

if(friends == 404) return res.send(404);

  sanitizedObjects = [];
  for(let i = 0; i < friends.length; i++){
    const friend = friends[i];

    const friendProfile = await Author.findOne({_id: friend.authorId}); 
    if(!friendProfile)
      continue

      sanitizedObject = {
      "type": "author",
      "id" : friendProfile._id,
      "host": process.env.DOMAIN_NAME,
      "displayname": friendProfile.username,
      "url":  process.env.DOMAIN_NAME + "users/" + friendProfile._id,
      "github": "",
      "profileImage": "",
      "email": friendProfile.email,
      "about": friendProfile.about,
      "pronouns": friendProfile.pronouns
    }

    sanitizedObjects.push(sanitizedObject);
  }

  return res.json({
    type: "friends",
    items: sanitizedObjects
  });
})

/**
 * @openapi
 * /api/authors/{authorId}/friends/{foreignId}:
 *  get:
 *    description: Gets the author's followers and friends as objects from the database and sends it back as a JSON object
 *    responses:
 *      404:
 *        description: Returns Status 404 when there are no existing followers or friends
 */
app.post('/', async (req, res) => {
  const authorId = req.params.authorId;
  const foreignId = req.params.foreignId;

  await isFriend(authorId, foreignId);
})
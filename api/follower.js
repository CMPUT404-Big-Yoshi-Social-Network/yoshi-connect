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
const { getFollowers, getFriends, addFollower, deleteFollower, getFollowings } = require('../routes/friend');

/**
 * @openapi
 * /api/authors/{authorId}/followers:
 *  get:
 *    description: Gets the author's followers and friends as objects from the database and sends it back as a JSON object
 *    responses:
 *      404:
 *        description: Returns Status 404 when there are no existing followers or friends
 */
app.get('/', async (req, res) => {
  const authorId = req.params.authorId;

  const followers = await getFollowers(authorId);

  if(followers == 404 || followings == 404) return res.send(404);

  sanitizedObjects = [];
  for(let i = 0; i < followers.length; i++){
    const follower = followers[i];

    const followerProfile = await Author.findOne({_id: follower.authorId}); 
    if(!followerProfile)
      continue

      sanitizedObject = {
      "type": "author",
      "id" : followerProfile._id,
      "host": process.env.DOMAIN_NAME,
      "displayname": followerProfile.username,
      "url":  process.env.DOMAIN_NAME + "users/" + followerProfile._id,
      "github": "",
      "profileImage": "",
      "email": followerProfile.email,
      "about": followerProfile.about,
      "pronouns": followerProfile.pronouns
    }

    sanitizedObjects.push(sanitizedObject);
  }

  return res.json({
    type: "followers",
    items: sanitizedObjects
  });
})

/**
 * @openapi
 * /api/authors/{authorId}/followers/{foreignAuthorId}:
 *  get:
 *    description: Gets the author's followers' and friends' profiles as objects from the database and sends it back as a JSON object
 *    responses:
 *      404:
 *        description: Returns Status 404 when the follower or friend object is not found
 *      404:
 *        description: Returns Status 404 when the profile doesn't exist
 */
app.get('/:foreignAuthorId', async (req, res) => {
  const authorId = req.params.authorId;
  const foreignId = req.params.foreignAuthorId;

  const followers = await getFollowers(authorId);
  const friends = await getFriends(authorId);

  if(followers == 404 || friends == 404)
    return res.send(404);

  for(let i = 0; i < followers.length; i++){
    const follower = followers[i];
    if(follower.authorId == foreignId){

      const followerProfile = await Author.findOne({_id: follower.authorId}); 
      if(!followerProfile)
        continue

      return res.json({
        "type": "author",
        "id" : followerProfile._id,
        "host": process.env.DOMAIN_NAME,
        "displayname": followerProfile.username,
        "url":  process.env.DOMAIN_NAME + "users/" + followerProfile._id,
        "github": "",
        "profileImage": "",
        "about": followerProfile.about,
        "pronouns": followerProfile.pronouns
      });
    }
  }

  for(let i = 0; i < friends.length; i++){
    const friend = friends[i];
    if(friend.authorId = foreignId){

      const friendProfile = await Author.findOne({_id: friend.authorId}); 

      if(!friendProfile)
        continue

      return res.json({
        "type": "author",
        "id" : friendProfile._id,
        "host": process.env.DOMAIN_NAME,
        "displayname": friendProfile.username,
        "url":  process.env.DOMAIN_NAME + "users/" + friendProfile._id,
        "github": "",
        "profileImage": "",
        "about": friendProfile.about,
        "pronouns": friendProfile.pronouns
      })
    }
  }

  return res.sendStatus(404);
})

/**
 * @openapi
 * /api/authors/{authorId}/followers/{foreignAuthorId}:
 *  put:
 *    description: Adds a Follower (Foreign Author) to the Author's Follower List in the database
 *    responses:
 *      401:
 *        description: Returns Status 401 when the adding the Follower is not authorized 
 *      400:
 *        description: Returns Status 400 when server is unable to process the user's request 
 */
app.put('/:foreignAuthorId', async (req, res) => {

  const authorId = req.params.authorId;
  const foreignId = req.params.foreignAuthorId;

  const follower = await addFollower(req.cookies["token"], authorId, foreignId, req.body, req, res);

  if(follower == 401)
    return res.sendStatus(401);
  else if(follower == 400)
    return res.sendStatus(400);
})

/**
 * @openapi
 * /api/authors/{authorId}/followers/{foreignAuthorId}:
 *  delete:
 *    description: Deletes a Follower (Foreign Author) to Author 
 *    responses:
 *      400:
 *        description: If the request has no type or if the type is not a follow request
 *      200:
 *        description: If the Follower (Foreign Author) was successfully deleted 
 */
app.delete('/:foreignAuthorId', async (req, res) => {
  if(req.body.type == undefined || req.body.type != "follower")
    return res.sendStatus(400)

  const authorId = req.params.authorId;
  const foreignId = req.params.foreignAuthorId;

  const statusCode = await deleteFollower(req.cookies["token"], authorId, foreignId, req.body);

  return res.sendStatus(statusCode);
})
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
const { getFollowers, addFollower, deleteFollower } = require('../routes/friend');
const { Author} = require('../scheme/author');
const { checkExpiry } = require('../routes/auth');

// Router Setup
const express = require('express'); 

// Router
const router = express.Router({mergeParams: true});

router.get('/', async (req, res) => {
  if ((await checkExpiry(req, res))) { return res.sendStatus(401) }
  const authorId = req.params.authorId;

  const followers = await getFollowers(authorId);

  if(followers == 404) return res.send(404);

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

router.get('/:foreignAuthorId', async (req, res) => {
  const authorId = req.params.authorId;
  const foreignId = req.params.foreignAuthorId;

  const followers = await getFollowers(authorId);

  if(followers == 404)
    return res.sendStatus(404);

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

  return res.sendStatus(404);
})

router.put('/:foreignAuthorId', async (req, res) => {
  if ((await checkExpiry(req, res))) { return res.sendStatus(401) }
  const authorId = req.params.authorId;
  const foreignId = req.params.foreignAuthorId;

  const follower = await addFollower(req.cookies["token"], authorId, foreignId, req.body, req, res);

  if(follower == 401)
    return res.sendStatus(401);
  else if(follower == 400)
    return res.sendStatus(400);
})

router.delete('/:foreignAuthorId', async (req, res) => {
  if ((await checkExpiry(req, res))) { return res.sendStatus(401) }
  if(req.body.type == undefined || req.body.type != "follower")
    return res.sendStatus(400)

  const authorId = req.params.authorId;
  const foreignId = req.params.foreignAuthorId;

  const statusCode = await deleteFollower(req.cookies["token"], authorId, foreignId, req.body);

  return res.sendStatus(statusCode);
})

module.exports = router;
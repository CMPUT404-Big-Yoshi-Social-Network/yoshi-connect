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
const { getFollowings, deleteFollowing } = require('../routes/friend');
const { checkExpiry } = require('../routes/auth');

// Router Setup
const express = require('express'); 

// Schemas
const { Author } = require('../scheme/author');

// Router
const router = express.Router({mergeParams: true});

router.get('/', async (req, res) => {
  if (!req.cookies || await checkExpiry(req.cookies["token"])) { return res.sendStatus(401) }
  const authorId = req.params.authorId;

  const followings = await getFollowings(authorId);
  if(followings == 404 || followings == 404) return res.sendStatus(404);

  sanitizedObjects = [];
  for(let i = 0; i < followings.length; i++){
    const following = followings[i];

    const followingProfile = await Author.findOne({_id: following.authorId}); 
    if(!followingProfile) continue

      sanitizedObject = {
      "type": "author",
      "id" : process.env.DOMAIN_NAME + "authors/" + followingProfile._id,
      "host": process.env.DOMAIN_NAME,
      "displayname": followingProfile.username,
      "url":  process.env.DOMAIN_NAME + "authors/" + followingProfile._id,
      "github": "",
      "profileImage": "",
      "email": followingProfile.email,
      "about": followingProfile.about,
      "pronouns": followingProfile.pronouns
    }

    sanitizedObjects.push(sanitizedObject);
  }

  return res.json({
    type: "followings",
    items: sanitizedObjects
  });
})

router.delete('/:foreignAuthorId', async (req, res) => {
  if (!req.cookies || await checkExpiry(req.cookies["token"])) { return res.sendStatus(401) }

  const authorId = req.params.authorId;
  const foreignId = req.params.foreignAuthorId;

  const statusCode = await deleteFollowing(authorId, foreignId);

  return res.sendStatus(statusCode);
})

module.exports = router;
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
const { getAuthor, apiUpdateAuthor, getAuthors, getCurrentAuthor } = require('./routes/author');
const { getAuthorLikes } = require('./routes/post');
const { checkExpiry } = require('../routes/auth');

// Router Setup
const express = require('express'); 

// Router
const router = express.Router();

router.get('/', async (req, res) => {
  if((await checkExpiry(req, res))){ return res.sendStatus(401) }
  if (req.body.data.status === 'Fetching authorId') { await getCurrentAuthor(req); }

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

router.get('/:authorId', async (req, res) => {
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

router.post('/:authorId/posts', async (req, res) => {
  if((await checkExpiry(req, res))){ return res.sendStatus(401) }
  await fetchMyPosts(req, res);
})

router.post('/:authorId', async (req, res) => {
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

router.get('/:authorId/liked', async (req, res) => {
  const authorId = req.params.authorId;

  const liked = getAuthorLikes(authorId);

  return res.json({
      "type":"liked",
      "items": liked
  })
})

module.exports = router;
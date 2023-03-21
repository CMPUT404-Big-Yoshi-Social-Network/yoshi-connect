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
const { createPost, updatePost, deletePost, getPost, getPosts, fetchMyPosts, fetchOtherPosts, uploadImage, getImage } = require('../routes/post');
const { fetchPublicPosts } = require('../routes/public');
const { fetchFriendPosts } = require('../routes/friend');

const { getAuthor } = require('../routes/author.js');

// Router Setup
const express = require('express'); 

// Router
const router = express.Router({mergeParams: true});

router.get('/public', async (req, res) => { await fetchPublicPosts(req, res); })

router.get('/friends-posts', async (req, res) => { await fetchFriendPosts(req, res); })

router.get('/personal', async (req, res) => { await fetchMyPosts(req, res); })

router.get('/other/:other', async (req, res) => { await fetchOtherPosts(req, res); })

router.get('/:postId', async (req, res) => {
  if (req.params.authorId == undefined) { return res.sendStatus(404); }

  const authorId = req.params.authorId;
  const postId = req.params.postId;

  let [post, status] = await getPost(authorId, postId);

  if (status != 200) { return res.sendStatus(status); }

  return res.json(post);
})

router.post('/:postId', async (req, res) => {
  const authorId = req.params.authorId;
  const postId = req.params.postId;

  if (!req.cookies.token) { res.sendStatus(401); }

  const [post, status] = await updatePost(req.cookies.token, authorId, postId, req.body);
  
  if (status == 200) {
    return res.json(post);
  } else {
    return res.sendStatus(status);
  }
})

router.delete('/:postId', async (req, res) => {
  const authorId = req.params.authorId;
  const postId = req.params.postId;

  if (!req.cookies.token) { return res.sendStatus(401); }

  const [post, status] = await deletePost(req.cookies.token, authorId, postId);

  if (status == 200) {
    return res.json(post);
  } else {
    return res.sendStatus(status);
  } 
})

router.put('/:postId', async (req, res) => {
  const authorId = req.params.authorId;
  const postId = req.params.postId;

  if (!req.cookies.token) { return res.sendStatus(401); }

  const [post, status] = await createPost(req.cookies.token, authorId, postId, req.body);

  if (status == 200) {
    return res.json(post);
  } else {
    return res.sendStatus(status);
  }
})

router.get('/', async (req, res) => {
  const authorId = req.params.authorId;
  
  let page = req.query.page ? parseInt(req.query.page) : 1;
  let size = req.query.size ? parseInt(req.query.size) : 5; 

  let [author, status] = await getAuthor(authorId);

  if (status != 200 || author.admin) { return res.sendStatus(status); }

  [posts, status] = await getPosts(page, size, author);

  if (status != 200) { return res.sendStatus(status); }

  return res.json({
    "type": "posts",
    "items": posts
  });
})

router.post('/', async (req, res) => {
  const authorId = req.params.authorId;

  if (!req.cookies.token) { return res.sendStatus(401); }

  const [post, status] = await createPost(req.cookies.token, authorId, undefined, req.body.data);

  if (status == 200) {
    return res.json(post);
  } else {
    return res.sendStatus(status); 
  }
})

router.get('/:postId/likes', async (req, res) => { return res.sendStatus(404); })

router.post("/:postId/image", async (req, res) => {  
  const [image, status] = await uploadImage(req.body.url, req.body.image);

  if (status == 200) {
    return res.json(image);
  } else {
    return res.sendStatus(status)
  }
})

router.get("/:postId/image", async (req, res) => { 
  const [image, status] = await getImage(req.originalUrl); 
  return res.json({
    src: image,
    status: status
  })
})
module.exports = router;
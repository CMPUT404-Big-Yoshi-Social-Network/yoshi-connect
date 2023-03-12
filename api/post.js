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
const { apicreatePost, apiupdatePost, apideletePost, apigetPost, getPosts } = require('../routes/post');
const { fetchPublicPosts } = require('../routes/public');

const { getAuthor } = require('../routes/author.js');

// Router Setup
const express = require('express'); 

// Router
const router = express.Router({mergeParams: true});

//TODO Change this to get request
router.post('/public', async (req, res) => {
  console.log('Debug: Getting the author following/public posts');
  await fetchPublicPosts(req, res);
})

//GET [local, remote] get the public post whose id is POST_ID
router.get('/:postId', async (req, res) => {
  if(req.params.authorId == undefined) return res.sendStatus(404);
  const authorId = req.params.authorId;
  const postId = req.params.postId;

  let [post, status] = await apigetPost(authorId, postId);

  if(status != 200){
    return res.sendStatus(status);
  }

  return res.json(post);
})

//POST [local] update the post whose id is POST_ID (must be authenticated)
router.post('/:postId', async (req, res) => {
  const authorId = req.params.authorId;
  const postId = req.params.postId;

  const status = await apiupdatePost(authorId, postId, req.body);
  
  if (status == 200) {
    return res.sendStatus(status);
  } else {
    return res.sendStatus(404);
  }
})

//DELETE [local] remove the post whose id is POST_ID
router.delete('/:postId', async (req, res) => {
  const authorId = req.params.authorId;
  const postId = req.params.postId;

  if(!req.cookies["token"]){
    return res.sendStatus(401);
  }

  const [post, status] = await apideletePost(req.cookies["token"], authorId, postId);

  if (status == 200) {
    return res.json(post);
  } else if (status == 404) {
    return res.sendStatus(404);
  } else if (status == 500) {
    return res.sendStatus(500);
  }
})

//PUT [local] create a post where its id is POST_ID
router.put('/:postId', async (req, res) => {
  const authorId = req.params.authorId;
  const postId = req.params.postId;

  if(!req.cookies["token"]){
    return res.sendStatus(401);
  }

  const [post, status] = await apicreatePost(req.cookies["token"], authorId, postId, req.body);

  if (status == 200) {
    return res.json(post);
  }
  else{
    return res.sendStatus(status);
  }
})

//GET [local, remote] get the recent posts from author AUTHOR_ID (paginated)
router.get('/', async (req, res) => {
  const authorId = req.params.authorId;
  
  let page = req.query.page ? parseInt(req.query.page) : 1;
  let size = req.query.size ? parseInt(req.query.size) : 5; 

  let [author, status] = await getAuthor(authorId);

  if(status != 200 || author.admin){
    return res.sendStatus(status);
  }

  [posts, status] = await getPosts(page, size, author);

  if(status != 200){
    return res.sendStatus(status);
  }

  return res.json({
    "type": "posts",
    "items": posts
  });
})

//POST [local] create a new post but generate a new id
router.post('/', async (req, res) => {
  const authorId = req.params.authorId;

  const [post, status] = await apicreatePost(req.cookies["token"], authorId, undefined, req.body);

  if (status == 200) {
    return res.json(post);
  }
  else{
    return res.sendStatus(status); 
  }
})

module.exports = router;
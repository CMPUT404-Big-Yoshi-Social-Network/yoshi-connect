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
const { getPosts, apicreatePost, apiupdatePost, apideletePost, apigetPost, getPostsPaginated } = require('../routes/post');
const { fetchPublicPosts } = require('../routes/public');

const { getAuthor } = require('../routes/author.js');

// Router Setup
const express = require('express'); 

// Router
const router = express.Router({mergeParams: true});

router.post('/public', async (req, res) => {
  console.log('Debug: Getting the author following/public posts');
  await fetchPublicPosts(req, res);
})

//GET [local, remote] get the public post whose id is POST_ID
router.get('/:postId', async (req, res) => {
  if(req.params.authorId == undefined) return res.sendStatus(404);
  const authorId = req.params.authorId;
  const postId = req.params.postId;

  let post = await apigetPost(authorId, postId);

  if(post === 404) return res.sendStatus(404);
  if(post === 500) return res.sendStatus(500);

  return res.json({
    "type": "post",
    "title" : post.title,
    "id": process.env.DOMAIN_NAME + "authors/" + authorId + "/" + postId,
    "source": post.source,
    "origin": post.origin,
    "description": post.description,
    "contentType": post.contentType,
    "author": post.author, 
    "categories": post.categories,
    "count": post.count,
    "comments": post.comments,
    "commentSrc": post.commentSrc,
    "published": post.published,
    "visibility": post.visibility,
    "unlisted": post.unlisted
  });
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

  const status = await apideletePost(authorId, postId);

  if (status == 200) {
    return res.sendStatus(status);
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

  const status = await apicreatePost(authorId, postId, req.body, process.env.DOMAIN_NAME);

  if (status == 200) {
    return res.sendStatus(status);
  } else if (status == 404) {
    return res.sendStatus(404);
  } else if (status == 500) {
    return res.sendStatus(500); 
  }  
})

//GET [local, remote] get the recent posts from author AUTHOR_ID (paginated)
router.get('/', async (req, res) => {
  const authorId = req.params.authorId;
  
  let page = req.query.page ? parseInt(req.query.page) : 1;
  let size = req.query.size ? parseInt(req.query.size) : 5; 

  let status;

  [author, status] = await getAuthor(authorId);

  if(status != 200 || author.admin){
    return res.sendStatus(status);
  }

  [posts, status] = await getPosts(page, size, authorId);

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

  const status = await apicreatePost(authorId, undefined, req.body, process.env.DOMAIN_NAME);

  if (status == 200) {
    return res.sendStatus(status);
  } else if (status == 404) {
    return res.sendStatus(404);
  } else if (status == 500) {
    return res.sendStatus(500); 
  }  
})

module.exports = router;
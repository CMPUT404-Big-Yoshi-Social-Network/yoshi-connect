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
const { createPost, updatePost, deletePost, getPost, getPosts, fetchMyPosts, fetchOtherPosts, uploadImage, getImage, editImage } = require('../routes/post');
const { fetchPublicPosts } = require('../routes/public');
const { fetchFriendPosts } = require('../routes/friend');

const { getAuthor } = require('../routes/author.js');

// Router Setup
const express = require('express'); 
const { getLikes } = require('../routes/likes');

// Router
const router = express.Router({mergeParams: true});

router.get('/other/:other', async (req, res) => { await fetchOtherPosts(req, res); })

router.get('/public', async (req, res) => { await fetchPublicPosts(req, res); })

router.get('/friends-posts', async (req, res) => { await fetchFriendPosts(req, res); })

router.get('/personal', async (req, res) => { await fetchMyPosts(req, res); })

router.get('/:postId', async (req, res) => {
  if (req.params.authorId == undefined) { return res.sendStatus(404); }

  const authorId = req.params.authorId;
  const postId = req.params.postId;

  let [author, authorStatus] = await getAuthor(authorId)

  if(authorStatus != 200){
    return res.sendStatus(authorStatus);
  }

  let [post, postStatus] = await getPost(postId, author);

  if (postStatus != 200) { return res.sendStatus(postStatus); }

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

  const [post, status] = await createPost(req.cookies.token, authorId, undefined, req.body);

  if (status == 200) {
    return res.json(post);
  }
  return res.sendStatus(status); 
})

router.get('/:postId/likes', async (req, res) => {
  //TODO: This endpoint is incorrect shift code over to sending like post
  //check expiry
  //check authLogin
  //know that author is not the owner of the post and are logged in
  //add like to post
  //add liked to authors history

  const authorId = req.params.authorId;
  const postId = req.params.postId;

  const [likes, status] = await getLikes(authorId, postId, null, "post");

  if(status != 200){
    return res.sendStatus(status)
  }

  return res.json(likes);

  /*
  const authorId = req.params.authorId;
  const postId = req.params.postId;

  if(!req.cookies || !checkExpiry(req.cookies["token"])){
    return res.sendStatus(401);
  }
  if(authLogin(req.cookies["token"], authorId)){
    return res.sendStatus(400);
  }

  const likeHistory = await Like.findOne({type: "post", Id: postId});
  for(let i = 0; i < likeHistory.likes.length; i++){
    like = likeHistory.liked[i];
    if(like.liker == authorId){
      return res.sendStatus(400);
    }
  }
  likeHistory.likes.push({
    liker: authorId
  }).save();


  const likedHistory = await Liked.findOne({authorId: authorId});

  likedHistory.liked.push({
    type: "post",
    Id: postId
  }).save();
  */
})

router.put('/:postId/likes', async (req, res) => {
  console.log('TODO: PUT Request that adds a like to the post from viewer (can get from token) RESPONSE expected to have response.data.numLikes')
})

router.delete('/:postId/likes', async (req, res) => {
  console.log('TODO: DELETE Request that deletes a like to the post from viewer (can get from token) RESPONSE expected to have response.data.numLikes')
})

router.get('/:postId/liked', async (req, res) => {
  //TODO we can refactor this endpoint to take multiple posts which will allow us to amortize the amount of time spent searching for public posts
  //Or we can merge public posts with getting liked posts
  console.log('TODO: GET Request that detects whether a post has already been liked by the viewer (which you can get from token); 200 means liked, 404 not liked etc')
})

router.post("/:postId/image", async (req, res) => {  
  const [image, status] = await editImage(req.body.url, req.body.image);

  if (status == 200) {
    return res.json(image);
  } else {
    return res.sendStatus(status)
  }
})

router.put("/:postId/image", async (req, res) => {  
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
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
const { apifetchLikes } = require('../routes/post');
const { hasLiked } = require('../routes/post'); 

// Router Setup
const express = require('express'); 

// Router
const router = express.Router({mergeParams: true});
//domainName/api/authors/:authorId/posts/:postId/
/*
router.get('/', async (req, res) => {
  const authorId = req.params.authorId;
  const postId = req.params.postId;
  let page = req.query.page;
  let size = req.query.size;

  if(page == undefined)
  page = 1;
  if(size == undefined)
    size = 5;
  
  const likes = apifetchLikes(authorId, postId);

  return res.json({
    "type": "likes",
    "page": page, 
    "size": size,
    "post": process.env.DOMAIN_NAME + "/authors/" + authorId + "/posts/" + postId,
    "id": process.env.DOMAIN_NAME + "/authors/" + authorId + "/posts/" + postId + "/likes",
    "likes": likes
    })

})

router.post('/', async (req, res) => {
  if (req.body.data.status == 'Checking if post is already liked') {
    await hasLiked(req, res);
  }
})
*/
router.get('/likes', async (req, res) => {

})

router.get('/comments/:commentId/likes', async (req, res) => {

})

module.exports = router;

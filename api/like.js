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
const { getAuthorLikes, apifetchLikes, apiFetchCommentLikes } = require('./routes/post');


/**
 * @openapi
 * /api/authors/{authorId}/posts/{postId}/likes:
 *  get:
 *    description: Fetches the likes related to a specific Post made by a specific Author (paginated)
 *    responses:
 *      200:
 *        description: Returns 200 if the likes were successfully fetched (i.e., return the likes )
 */
app.get('/api/authors/:authorId/posts/:postId/likes', async (req, res) => {
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

/**
 * @openapi
 * /api/authors/:authorId/posts/:postId/comments/:commentId/likes:
 *  get:
 *    description: Fetches the likes on a specific comment on a specific post by a specific author
 *    responses:
 *      200:
 *        description: Returns 200 if server retrieves the likes for the comment on a post 
 */
app.get('/api/authors/:authorId/posts/:postId/comments/:commentId/likes', async (req, res) => {
  const authorId = req.params.authorId;
  const postId = req.params.postId;
  const commentId = req.params.commentId
  let page = req.query.page;
  let size = req.query.size;

  if(page == undefined)
  page = 1;
  if(size == undefined)
    size = 5;

  const likes = apiFetchCommentLikes(authorId, postId, commentId); 

  return res.json({
    "type": "likes",
    "page": page,
    "size": size,
    "post": process.env.DOMAIN_NAME + "/authors/" + authorId + "/posts/" + postId,
    "comment": process.env.DOMAIN_NAME + "/authors/" + authorId + "/posts/" + postId + "/comments/" + commentId,
    "id": process.env.DOMAIN_NAME + "/authors/" + authorId + "/posts/" + postId + "/comments" + commentId + "/likes",
    "likes": likes
    })
 })

/**
 * @openapi
 * /api/authors/:authorId/liked:
 *  get:
 *    description: Fetches all the likes the author has made 
 *    responses:
 *      200:
 *        description: Returns 200 with the list of likes the author has made
 */
app.get('/api/authors/:authorId/liked', async (req, res) => {
  const authorId = req.params.authorId;

  const liked = getAuthorLikes(authorId);

  return res.json({
      "type":"liked",
      "items": liked
  })
})

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
const { fetchPosts, apicreatePost, apiupdatePost, apideletePost, apigetPost } = require('./routes/post');
const { hasLiked } = require('./routes/post'); // temporary

app.post('/api/posts/', async (req, res) => {
  if (req.body.data.status == 'Checking if post is already liked') {
    await hasLiked(req, res);
  }
})

/**
 * @openapi
 * /api/authors/{authorId}/posts/{postId}:
 *  get:
 *    description: Gets the a specific Post from the database made by a specific Author 
 *    responses:
 *      200:
 *        description: Returns the Post as a JSON object
 *      404:
 *        description: When the Post or Author is not found 
 *      500: 
 *        description: When the server is unable to get the Post
 */
app.get('/api/authors/:authorId/posts/:postId', async (req, res) => {
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

/**
 * @openapi
 * /api/authors/{authorId}/posts/{postId}:
 *  post:
 *    description: Updates an existing Post made by a specific Author 
 *    responses:
 *      200:
 *        description: Returns Status 200 when the server successfully updated the Post
 *      404:
 *        description: Returns Status 404 when the server was unable to find any Post related to the given URL
 */
app.post('/api/authors/:authorId/posts/:postId', async (req, res) => {
  const authorId = req.params.authorId;
  const postId = req.params.postId;

  const status = await apiupdatePost(authorId, postId, req.body);
  
  if (status == 200) {
    return res.sendStatus(status);
  } else {
    return res.sendStatus(404);
  }
})

/**
 * @openapi
 * /api/authors/{authorId}/posts/{postId}:
 *  delete:
 *    description: Deletes a specific Post made by a specific Author
 *    responses:
 *      200:
 *        description: Returns Status 200 if the server successfully deleted the Post
 *      404:
 *        description: Returns Status 404 if the server was unable to find either the Author or the Author's Post
 *      500:
 *        description: Returns Status 500 if the server was unable to delete the Post
 */
app.delete('/api/authors/:authorId/posts/:postId', async (req, res) => {
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

/**
 * @openapi
 * /api/authors/{authorId}/posts/{postId}:
 *  put:
 *    description: Creates a Post object made by a specific Author 
 *    responses:
 *      200:
 *        description: Returns Status 200 if the Post was able to be stored into the database 
 *      404:
 *        description: Returns Status 404 if the Author or Post does not exist 
 *      500: 
 *        description: Returns Status 500 if the server was unable to create and save the Post
 */
app.put('/api/authors/:authorId/posts/:postId', async (req, res) => {
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

/**
 * @openapi
 * /api/authors/{authorId}/posts:
 *  get:
 *    description: Fetches the posts of a specific Author 
 *    responses:
 *      200:
 *        description: Returns a list of Posts by a specific Author
 */
app.get('/api/authors/:authorId/posts', async (req, res) => {
  const authorId = req.params.authorId;
  const page = req.query.page;
  const size = req.query.size;

  if(page == undefined)
  page = 1;
  if(size == undefined)
    size = 5;

  const sanitizedPosts = await fetchPosts(page, size, authorId);

  return res.json({
    "type": "posts",
    "authorId": authorId,
    "items": [sanitizedPosts]
  });
})

/**
 * @openapi
 * /api/authors/{authorId}/posts:
 *  post:
 *    description: Creates a Post given no PostId (i.e., needs to be generated)
 *    responses:
 *      200:
 *        description: Returns Status 200 if the Post was successfully created and saved into the database
 *      404:
 *        description: Returns Status 404 if the Author does not exist 
 *      500 
 *        description: Returns Status 500 if the server was unable to store or create the Post 
 */
app.post('/api/authors/:authorId/posts', async (req, res) => {
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
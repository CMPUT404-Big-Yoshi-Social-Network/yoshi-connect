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

// Setting up database
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config();
mongoose.connect(process.env.ATLAS_URI, {dbName: "yoshi-connect"}).catch(err => console.log(err));

// OpenAPI
const {options} = require('./openAPI/options.js');

// Swaggerio
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require('swagger-jsdoc');
const openapiSpecification = swaggerJsdoc(options);

// App Setup
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const path = require('path');

// Routing Functions 
const { authAuthor, removeLogin, checkExpiry, sendCheckExpiry, checkAdmin } = require('./routes/auth');
const { registerAuthor, getProfile, getCurrentAuthor, getCurrentAuthorUsername, fetchMyPosts, getCurrentAuthorAccountDetails, updateAuthor, getAuthor, apiUpdateAuthor, getAuthors } = require('./routes/author');
const { createPost, getPost, getPostsPaginated, updatePost, deletePost, addLike, addComment, getComments, apifetchLikes, fetchPosts, deleteLike, apicreatePost, hasLiked, apiupdatePost, apideletePost, deleteComment, editComment, checkVisibility, getAuthorByPost, apigetPost } = require('./routes/post');
const { saveRequest, deleteRequest, findRequest, findAllRequests, senderAdded, sendRequest, apideleteRequest } = require('./routes/request');
const { isFriend, unfriending, unfollowing } = require('./routes/relations');
const { fetchFriends, fetchFriendPosts, getFollowers, getFriends, addFollower, deleteFollower } = require('./routes/friend');
const { fetchFollowing, fetchPublicPosts } = require('./routes/public');
const { addAuthor, modifyAuthor, deleteAuthor } = require('./routes/admin');

// App Uses
app.use(express.static(path.resolve(__dirname + '/yoshi-react/build'))); 
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());
app.set('views', path.resolve( __dirname, './yoshi-react/build'));

// Schemas
const { Author } = require('./dbSchema/authorScheme.js');

if (process.env.NODE_ENV === "development") { app.use(express.static("./yoshi-react/build")); }

app.use('/server/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(openapiSpecification)
);

app.get('/favicon.ico', (req, res) => { res.sendStatus(404); })

/**
 * @openapi
 * /server/signup:
 *  post:
 *    security:
 *      - loginToken: []
 *    description: Signup url. Allows creation of an account and automatically logins to this new account. 
 *    responses:
 *      200:
 *        description: Successfully created an account
 *        headers:
 *         Set-Cookie:
 *            schema:
 *              type: string
 *              description: This token identifies you as being logged in and allows you to perform other api calls
 *              example: token=QV1hAYUZU5Qu2dkrP4peLN
 *      400:
 *        description: NEEDS TO BE REFACTORED Signup not possible, username, is already taken, field missing, etc.
 */
app.post('/server/signup', async (req, res) => {
  console.log('Debug: Signing up as an author');
  await registerAuthor(req, res);
})

/**
 * @openapi
 * /server/login:
 *  post:
 *    description: Login url, so you can authenticate locally with the server
 *    responses:
 *      200:
 *        description: Successfully created an account
 *        headers:
 *         Set-Cookie:
 *            schema:
 *              type: string
 *              description: This token identifies you as being logged in and allows you to perform other api calls
 *              example: token=QV1hAYUZU5Qu2dkrP4peLN
 *      400:
 *        description: NEEDS TO BE REFACTORED Login not possible. Failed due to incorrect username or password. 
 */
app.post('/server/login', async (req, res) => {
  console.log('Debug: Login as Author')
  await authAuthor(req, res);
})

app.post('/server/admin', async (req, res) => {
  console.log('Debug: Login as Admin')
  await authAuthor(req, res);
})

app.get('/server/admin/dashboard', async (req, res) => {
  console.log('Debug: Checking expiry of token')
  if(!(await checkAdmin(req, res))){
	return res.sendStatus(403)
  }

  if((await checkExpiry(req, res))){
	return res.json({
	  status: "Unsuccessful",
	  message: "Token expired"
	})
  }

  return res.json({
	status: "Successful",
	message: "Here's the dashboard"
  })
})

app.post('/server/admin/dashboard', async (req, res) => {
  if (req.body.data.status == 'Logging Out') {
	console.log('Debug: Logging out as Admin')
	removeLogin(req, res);
  } else if (req.body.data.status == 'Fetching Authors') {
	console.log('Debug: Getting all authors.')
	return res.json({
	  authors: await Author.find()
	})
  }
})

app.delete('/server/admin/dashboard', (req, res) => {
  if (req.body.status == 'Delete an Author') {
	console.log('Debug: Deleting an Author.');
	deleteAuthor(req, res);
  }
})

app.put('/server/admin/dashboard', (req, res) => {
  if (req.body.data.status == 'Add New Author') {
	console.log('Debug: Adding a new Author.');
	addAuthor(req, res);
  } else if (req.body.data.status == 'Modify an Author') {
	console.log('Debug: Modifying the Author.')
	modifyAuthor(req, res);
  }
})

app.get('/server/feed', (req, res) => {
  console.log('Debug: Checking expiry of token')
  sendCheckExpiry(req, res);
})

app.post('/server/feed', (req, res) => {
  if (req.body.data.message == 'Logging Out') {
	console.log('Debug: Logging out as Author')
	removeLogin(req, res);
  }
})

app.post('/server/posts/', async (req, res) => {
  if ( req.body.data.status == 'Fetching current authorId') { 
    console.log('Debug: Getting the current author logged in');
    await getCurrentAuthor(req, res);
  } else if (req.body.data.status == 'Checking if post is already liked') {
    await hasLiked(req, res);
  } else if (req.body.data.status == 'Fetching authorId') {
    await getAuthorByPost(req, res);
  } else {
    console.log('Debug: Paging the posts created by other (not the logged in author)');
    await getPostsPaginated(req, res);
  }
})

app.put('/server/authors/:author_id/posts/', async (req, res) => {
  console.log('Debug: Creating a post')
  await createPost(req, res);
})

app.get('/server/authors/:author_id/posts/', async (req, res) => {
  console.log('Debug: Paging the posts created by the logged in author');
	if ( await checkExpiry(req, res) ) {
	  return res.sendStatus(404);
	}
  await getPostsPaginated(req, res);
})

app.get('/server/authors/:author_id/posts/:post_id', async (req, res) => {
  console.log('Debug: Viewing a specific post by a specific author');
  if ( await checkExpiry(req, res) ) {
	return res.sendStatus(404);
  }
  await getPost(req, res);
})

app.post('/server/authors/:author_id/posts/:post_id', async (req, res) => {
  console.log('Debug: Updating a specific post by a specific author')
  if ( await checkExpiry(req, res) ) {
	return res.sendStatus(404);
  } else if ( req.body.data.status == 'Checking Visibility') {
	console.log('Debug: Checking the visibility of a post');
	checkVisibility(req, res);
  } else if (req.body.data.status == 'Modify') {
	console.log('Debug: Updating a post');
	await updatePost(req, res);
  }
})

app.delete('/server/authors/:author_id/posts/:post_id', async (req, res) => {
   console.log('Debug: Deleting a specific post by a specific author')
  if ( await checkExpiry(req, res) ) { return res.sendStatus(404); }
  if ( req.body.status == 'Remove like' ) {
    console.log('Debug: Removing a like from a post!')
    deleteLike(req, res);
  } else if ( req.body.status == 'Remove comment' ) {
    console.log('Debug: Removing a comment from a post!')
    deleteComment(req, res);
  } else if ( req.body.status == 'Remove post') {
    await deletePost(req, res);
  }
})

app.put('/server/authors/:author_id/posts/:post_id', async (req, res) => {
  if ( await checkExpiry(req, res) ) { return res.sendStatus(404); }
  if ( req.body.status == 'Add comment' ) {
    console.log('Debug: Adding a comment to a post!');
    addComment(req, res);
  } else if ( req.body.data.status == 'Add like' ) {
    console.log('Debug: Adding a like to a post!');
    addLike(req, res);
  } else if ( req.body.data.status == 'Modify comment' ) {
    console.log('Debug: Updating a comment on a post!')
    editComment(req, res);
  } else {
	  await createPost(req, res, req.params.post_id);
  }
})

app.get('/server/users/:username', async (req,res) => {
  if (await checkExpiry(req)) { return res.sendStatus(401); }
  getProfile(req, res);
})

app.post('/server/users/posts', async (req, res) => {
  console.log('Debug: Getting the author posts');
  await fetchMyPosts(req, res);
})

app.post('/server/requests', async (req, res) => {
  if (req.body.data.status == 'Fetching Requests') {
    console.log('Debug: Getting friend requests')
    findAllRequests(req, res);
  } else if ( req.body.data.status == 'Fetching current authorId') { 
	  console.log('Debug: Getting the current author logged in');
	  await getCurrentAuthorUsername(req, res);
	} 
})

app.put('/server/requests', (req, res) => {
  if (req.body.data.status == 'Sender is added by Receiver') {
    console.log('Debug: Sender added by Receiver')
    senderAdded(req, res);
  } 
})

app.delete('/server/requests', (req, res) => {
  if (req.body.status == 'Sender is rejected by Receiver') {
    console.log('Debug: Sender rejected by Receiver')
    deleteRequest(req, res);
  }
})

app.post('/server/users/:username', async (req, res) => {
  if (req.body.data.message == 'Logging Out') {
    console.log('Debug: Logging out as Author')
    removeLogin(req, res);
  } else if (req.body.data.status == 'Does Request Exist') {
    console.log('Debug: Checking if Friend Request Exists')
    findRequest(req, res);
  } else if (req.body.data.status == 'Friends or Follows') {
    console.log('Debug: Checking if they are friends or follows.')
    await isFriend(req, res);
  }
})

app.put('/server/users/:username', async (req, res) => {
  if (req.body.data.status == 'Save Request') {
    console.log('Debug: Saving Friend Request')
    saveRequest(req, res);
  } else if (req.body.data.status == 'Unfriending') {
    console.log('Debug: Viewer unfriending viewed.')
    await unfriending(req, res);
  } else if (req.body.data.status == 'Unfollowing') {
    console.log('Debug: Viewer unfollowing viewer.')
    await unfollowing(req, res);
  }
})

app.delete('/server/users/:username', (req, res) => {
  if (req.body.status == 'Delete Request') {
    console.log('Debug: Deleting Friend Request')
    deleteRequest(req, res);
  }
})

app.get('/server/nav', async (req, res) => {
  console.log('Debug: Getting the current author logged in');
  await getCurrentAuthorUsername(req, res);
})

app.get('/server/friends', (req, res) => {
  console.log('Debug: Checking expiry of token')
  sendCheckExpiry(req, res);
})

app.post('/server/friends', (req, res) => {
  console.log('Debug: Getting the author friends');
  fetchFriends(req, res);
})

app.post('/server/friends/posts', (req, res) => {
  console.log('Debug: Getting the author friends posts');
  fetchFriendPosts(req, res);
})

app.post('/server/following', async (req, res) => {
  console.log('Debug: Getting the author following');
  await fetchFollowing(req, res);
})

app.post('/server/public/posts', async (req, res) => {
  console.log('Debug: Getting the author following/public posts');
  await fetchPublicPosts(req, res);
})

app.post('/server/settings', async (req, res) => {
  console.log('Debug: Updating author account details');
  if (req.body.data.status === 'Get Author') { await getCurrentAuthorAccountDetails(req, res); }
})

app.put('/server/settings', async (req, res) => {
  console.log('Debug: Updating author account details');
  if (req.body.data.status === 'Modify an Author') { await updateAuthor(req, res); }
})

/*
UPDATED API
*/

/**
 * @openapi
 * /api/authors:
 *  get:
 *    description: Get a list of authors, paginated. by default it's page 1 with size 1. Currently pages are broken
 *    responses:
 *      200:
 *        description: A list of authors
 */
app.get('/api/authors', async (req, res) => {
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

/**
 * @openapi
 * /api/authors/:authorId:
 *  get:
 *    description: Fetchs a single Author object from the database and sends it back as a JSON object
 *    responses:
 *      404:
 *        description: Returns Status 404 when an Author does not exist 
 *      500:
 *        description: Returns Status 500 when the server is unable to retrieve the Author from the database
 */
app.get('/api/authors/:authorId', async (req, res) => {
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

/**
 * @openapi
 * /api/authors/:authorId:
 *  post:
 *    description: Gets the author's cookies from the database and sends the status
 *    responses:
 *      404:
 *        description: Returns Status 404 when the cookies don't exist
 *      400:
 *        description: Returns Status 400 when the body type doesn't match the author 
 *      400:
 *        description: Returns Status 400 when the author ID, host, nor username are valid 
 */
app.post('/api/authors/:authorId', async (req, res) => {
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

/**
 * @openapi
 * /api/authors/:authorId/followers:
 *  get:
 *    description: Gets the author's followers and friends as objects from the database and sends it back as a JSON object
 *    responses:
 *      404:
 *        description: Returns Status 404 when there are no existing followers or friends
 */
app.get('/api/authors/:authorId/followers', async (req, res) => {
  /**
   * Description: Getting followers of current author 
   *     - Friends are not only friends but also followers
   */
  const authorId = req.params.authorId;

  const followers = await getFollowers(authorId);
  const friends = await getFriends(authorId);

  if(followers == 404 || friends == 404)
    return res.send(404);

  santizedFollowers = [];
  for(let i = 0; i < followers.length; i++){
    const follower = followers[i];

    const followerProfile = await Author.findOne({_id: follower.authorId}); 
    if(!followerProfile)
      continue

    santizedFollower = {
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

    santizedFollowers.push(santizedFollower);
  }

  for(let i = 0; i < friends.length; i++){
    const friend = friends[i];

    const friendProfile = await Author.findOne({_id: friend.authorId}); 
    if(!friendProfile)
      continue
    santizedFollower = {
      "type": "author",
      "id" : friendProfile._id,
      "host": process.env.DOMAIN_NAME,
      "displayname": friendProfile.username,
      "url":  process.env.DOMAIN_NAME + "users/" + friendProfile._id,
      "github": "",
      "profileImage": "",
      "about": friendProfile.about,
      "pronouns": friendProfile.pronouns
    }

    santizedFollowers.push(santizedFollower);
  }

  return res.json({
    type: "followers",
    items: santizedFollowers
  });
})

/**
 * @openapi
 * /api/authors/:authorId/followers/:foreignAuthorId:
 *  get:
 *    description: Gets the author's followers' and friends' profiles as objects from the database and sends it back as a JSON object
 *    responses:
 *      404:
 *        description: Returns Status 404 when the follower or friend object is not found
 *      404:
 *        description: Returns Status 404 when the profile doesn't exist
 */
app.get('/api/authors/:authorId/followers/:foreignAuthorId', async (req, res) => {
  const authorId = req.params.authorId;
  const foreignId = req.params.foreignAuthorId;

  const followers = await getFollowers(authorId);
  const friends = await getFriends(authorId);

  if(followers == 404 || friends == 404)
    return res.send(404);

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

  for(let i = 0; i < friends.length; i++){
    const friend = friends[i];
    if(friend.authorId = foreignId){

      const friendProfile = await Author.findOne({_id: friend.authorId}); 

      if(!friendProfile)
        continue

      return res.json({
        "type": "author",
        "id" : friendProfile._id,
        "host": process.env.DOMAIN_NAME,
        "displayname": friendProfile.username,
        "url":  process.env.DOMAIN_NAME + "users/" + friendProfile._id,
        "github": "",
        "profileImage": "",
        "about": friendProfile.about,
        "pronouns": friendProfile.pronouns
      })
    }
  }

  return res.sendStatus(404);
})

/**
 * @openapi
 * /api/authors/:authorId/followers/:foreignAuthorId:
 *  put:
 *    description: Adds a Follower (Foreign Author) to the Author's Follower List in the database
 *    responses:
 *      401:
 *        description: Returns Status 401 when the adding the Follower is not authorized 
 *      400:
 *        description: Returns Status 400 when server is unable to process the user's request 
 */
app.put('/api/authors/:authorId/followers/:foreignAuthorId', async (req, res) => {

  const authorId = req.params.authorId;
  const foreignId = req.params.foreignAuthorId;

  const follower = await addFollower(req.cookies["token"], authorId, foreignId, req.body, req, res);

  if(follower == 401)
    return res.sendStatus(401);
  else if(follower == 400)
    return res.sendStatus(400);
})

/**
 * @openapi
 * /api/authors/:authorId/followers/:foreignAuthorId:
 *  delete:
 *    description: Deletes a Follower (Foreign Author) to Author 
 *    responses:
 *      400:
 *        description: If the request has no type or if the type is not a follow request
 *      200:
 *        description: If the Follower (Foreign Author) was successfully deleted 
 */
app.delete('/api/authors/:authorId/followers/:foreignAuthorId', async (req, res) => {
  if(req.body.type == undefined || req.body.type != "follower")
    return res.sendStatus(400)

  const authorId = req.params.authorId;
  const foreignId = req.params.foreignAuthorId;

  const statusCode = await deleteFollower(req.cookies["token"], authorId, foreignId, req.body);

  return res.sendStatus(statusCode);
})

/**
 * @openapi
 * /api/authors/:authorId/requests/:foreignAuthorId:
 *  put:
 *    description: Saves the Request for the Foreign Author from the Author into the database 
 *    responses:
 *      200:
 *        description: Returns the JSON object representing the Request  
 */
app.put('/api/authors/:authorId/requests/:foreignAuthorId', async (req, res) => {
  const authorId = req.params.authorId;
  const foreignId = req.params.foreignAuthorId;

  const request = await sendRequest(authorId, foreignId, res);

  return res.json({
    "type": request.type,
    "summary": request.summary,
    "actor": request.actor,
    "object": request.object
  })
})

/**
 * @openapi
 * /api/authors/:authorId/requests/:foreignAuthorId:
 *  delete:
 *    description: Deletes a Request made by the Author  to Foreign Author
 *    responses:
 *     200:
 *        description: Returns the JSON object representing the Request 
 */
app.delete('/api/authors/:authorId/requests/:foreignAuthorId', async (req, res) => {
  const authorId = req.params.authorId;
  const foreignId = req.params.foreignAuthorId;

  const request = await apideleteRequest(authorId, foreignId, res);

  return res.json({
    "type": request.type,
    "summary": request.summary,
    "actor": request.actor,
    "object": request.object
  })
})

/**
 * @openapi
 * /api/authors/:authorId/posts/:postId:
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
 * /api/authors/:authorId/posts/:postId:
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
 * /api/authors/:authorId/posts/:postId:
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
 * /api/authors/:authorId/posts/:postId:
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
 * /api/authors/:authorId/posts:
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

  const sanitizedPosts = await fetchPosts(page, size, authorId);

  return res.json({
    "type": "posts",
    "authorId": authorId,
    "items": [sanitizedPosts]
  });
})

/**
 * @openapi
 * /api/authors/:authorId/posts:
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

/**
 * @openapi
 * /api/authors/:authorId/posts/:postId/comments:
 *  get:
 *    description: Gets the comments related to a specific Post made by a specific Author (paginated)
 *    responses:
 *      200:
 *        description: Returns Status 200 when the comments have been successfully found (i.e., returns list of comments)
 */
app.get('/api/authors/:authorId/posts/:postId/comments', async (req, res) => {
  const authorId = req.params.authorId;
  const postId = req.params.postId;

  const comments = getComments(authorId, postId);

  return res.json({
    "type": "comments",
    "page": 1,
    "size": 5,
    "post": process.env.DOMAIN_NAME + "/authors/" + authorId + "/posts/" + postId,
    "id": process.env.DOMAIN_NAME + "/authors/" + authorId + "/posts/" + postId + "/comments",
    "comments": comments
    })
})

/**
 * @openapi
 * /api/authors/:authorId/posts/:postId/comments:
 *  post:
 *    description: Creates a comment for a specific Post made by a specific Author
 *    responses:
 *      200:
 *        description: Returns 200 when the comment was successfully made (i.e., returns the comment)
 */
app.post('/api/authors/:authorId/posts/:postId/comments', async (req, res) => {
  const authorId = req.params.authorId;
  const postId = req.params.postId;

  const comment = createComment(authorId, postId, req.body, process.env.DOMAIN_NAME);

  return res.json({
    "type": "comment",
    "author": comment.author,
    "comment": comment.comment,
    "contentType": comment.contentType,
    "published": comment.published,
    "id": comment._id
    }) 
})


/**
 * @openapi
 * /api/authors/:authorId/posts/:postId/likes:
 *  get:
 *    description: Fetches the likes related to a specific Post made by a specific Author (paginated)
 *    responses:
 *      200:
 *        description: Returns 200 if the likes were successfully fetched (i.e., return the likes )
 */
app.get('/api/authors/:authorId/posts/:postId/likes', async (req, res) => {
  const authorId = req.params.authorId;
  const postId = req.params.postId;
  
  const likes = apifetchLikes(authorId, postId);

  return res.json({
    "type": "likes",
    "page": 1, 
    "size": 5,
    "post": process.env.DOMAIN_NAME + "/authors/" + authorId + "/posts/" + postId,
    "id": process.env.DOMAIN_NAME + "/authors/" + authorId + "/posts/" + postId + "/likes",
    "likes": likes
    })

})

//TODO 
app.get('/api/authors/:authorId/posts/:postId/comments/:commentId/likes', async (req, res) => { })

//Liked

//TODO 
app.get('/api/authors/:authorId/liked', async (req, res) => { })

//Inbox

//TODO 
app.get('/api/authors/:authorId/inbox', async (req, res) => { })

//TODO 
app.post('/api/authors/:authorId/inbox', async (req, res) => { })

//TODO 
app.delete('/api/authors/:authorId/inbox', async (req, res) => { })

/*
END OF NEW API STUFF
*/

app.get('/',(req, res) => {
  res.render("index");
}); 

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'yoshi-react/build', 'index.html'));
});


app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
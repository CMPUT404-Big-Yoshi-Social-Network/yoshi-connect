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

// Middleware
const signup = require('./api/signup');
const login = require('./api/login');
const admin = require('./api/admin');
const followers = require('./api/follow');
const followings = require('./api/following');
const profile = require('./api/profile');
const friends = require('./api/friend');
const requests = require('./api/request');
const apiDocs = require('./api/swagger');

// Routing Functions 
const { removeLogin, checkExpiry, sendCheckExpiry } = require('./routes/auth');
const { getCurrentAuthor, getCurrentAuthorUsername, fetchMyPosts, getCurrentAuthorAccountDetails, updateAuthor } = require('./routes/author');
const { createPost, getPost, getPostsPaginated, updatePost, deletePost, addLike, addComment, deleteLike, hasLiked, deleteComment, editComment, checkVisibility, getAuthorByPost } = require('./routes/post');
const { fetchFriendPosts } = require('./routes/friend');
const { fetchPublicPosts } = require('./routes/public');

// App Uses
app.use(express.static(path.resolve(__dirname + '/yoshi-react/build'))); 
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());
app.set('views', path.resolve( __dirname, './yoshi-react/build'));

// Routing
app.use("/api/signup", signup);
app.use("/api/login", login);
app.use("/api/admin", admin);
app.use("/api/authors/:authorId/followers", followers);
app.use("/api/authors/:authorId/followings", followings);
app.use("/api/profile", profile);
app.use("/api/authors/:authorId/friends", friends);
app.use("/api/authors/:authorId/requests", requests);
app.use("/api/api-docs", apiDocs);

if (process.env.NODE_ENV === "development") { app.use(express.static("./yoshi-react/build")); }

app.get('/favicon.ico', (req, res) => { res.sendStatus(404); })

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

app.post('/server/users/posts', async (req, res) => {
  console.log('Debug: Getting the author posts');
  await fetchMyPosts(req, res);
})

app.post('/server/friends/posts', (req, res) => {
  console.log('Debug: Getting the author friends posts');
  fetchFriendPosts(req, res);
})

app.post('/server/public/posts', async (req, res) => {
  console.log('Debug: Getting the author following/public posts');
  await fetchPublicPosts(req, res);
})

app.get('/',(req, res) => {
  res.render("index");
}); 

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'yoshi-react/build', 'index.html'));
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
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
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});
require('dotenv').config()
mongoose.set('strictQuery', true);

// Setting up app
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const path = require('path');
const { authAuthor, removeLogin, checkExpiry, sendCheckExpiry, checkAdmin } = require('./auth');
const { register_author, get_profile, getCurrentAuthor } = require('./routes/author');
const { create_post, get_post, get_posts_paginated, update_post, delete_post, addLike, addComment, deleteLike, deleteComment, editComment, checkVisibility, fetchLikers } = require('./routes/post');
const { saveRequest, deleteRequest, findRequest, findAllRequests, senderAdded } = require('./routes/request');
const { isFriend, unfriending, unfollowing } = require('./routes/relations');

app.use(express.static(path.resolve(__dirname + '/yoshi-react/build'))); 
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());
app.set('views', path.resolve( __dirname, './yoshi-react/build'));

// Connect to database
mongoose.connect(process.env.ATLAS_URI, {dbName: "yoshi-connect"});

if (process.env.NODE_ENV === "development") {
  app.use(express.static("./yoshi-react/build"));
}

app.get('/favicon.ico', (req, res) => {
  res.sendStatus(404);
})

// Sign up page 
app.post('/server/signup', async (req, res) => {
  console.log('Debug: Signing up as an author');
  await register_author(req, res);
})

// Login page
app.post('/server/login', async (req, res) => {
  console.log('Debug: Login as Author')
  await authAuthor(req, res);
})

// Admin Login page
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

app.post('/server/admin/dashboard', (req, res) => {
  if (req.body.data.message == 'Logging Out') {
    console.log('Debug: Logging out as Admin')
    removeLogin(req, res);
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
  } else {
    console.log('Debug: Paging the posts created by other (not the logged in author)');
    await get_posts_paginated(req, res);
  }
})

app.put('/server/authors/:author_id/posts/', async (req, res) => {
  console.log('Debug: Creating a post')
  await create_post(req, res);
})

app.get('/server/authors/:author_id/posts/', async (req, res) => {
  console.log('Debug: Paging the posts created by the logged in author');
    if ( await checkExpiry(req, res) ) {
      return res.sendStatus(404);
    }
  await get_posts_paginated(req, res);
})

app.get('/server/authors/:author_id/posts/:post_id', async (req, res) => {
  console.log('Debug: Viewing a specific post by a specific author');
  if ( await checkExpiry(req, res) ) {
    return res.sendStatus(404);
  }
  await get_post(req, res);
})

app.post('/server/authors/:author_id/posts/:post_id', async (req, res) => {
  console.log('Debug: Updating a specific post by a specific author')
  if ( await checkExpiry(req, res) ) {
    return res.sendStatus(404);
  } else if ( req.body.data.status == 'Checking Visibility') {
    console.log('Debug: Checking the visibility of a post');
    checkVisibility(req, res);
  } else if ( req.body.data.status == 'Fetching likers') {
    console.log('Debug: Viewing list of likers for a specific post');
    fetchLikers(req, res);
  } else {
    console.log('Debug: Updating a post');
    await update_post(req, res);
  }
})

app.delete('/server/authors/:author_id/posts/:post_id', async (req, res) => {
   console.log('Debug: Deleting a specific post by a specific author')
  if ( await checkExpiry(req, res) ) {
    return res.sendStatus(404);
  }
  if ( req.body.data.status == 'Remove like' ) {
    console.log('Debug: Removing a like from a post!')
    deleteLike(req, res);
  } else if ( req.body.data.status == 'Remove comment' ) {
    console.log('Debug: Removing a comment from a post!')
    deleteComment(req, res);
  } else {
    await delete_post(req, res);
  }
})

app.put('/server/authors/:author_id/posts/:post_id', async (req, res) => {
  if ( await checkExpiry(req, res) ) {
    return res.sendStatus(404);
  }

  if ( req.body.data.status == 'Add like' ) {
    console.log('Debug: Adding a like to a post!');
    addLike(req, res);
  } else if ( req.body.data.status == 'Add comment' ) {
    console.log('Debug: Adding a comment to a post!');
    addComment(req, res);
  } else if ( req.body.data.status == 'Edit comment' ) {
    console.log('Debug: Updating a comment on a post!')
    editComment(req, res);
  } else {
    await create_post(req, res, req.params.post_id);
  }
})

app.get('/server/users/:username', async (req,res) => {
  if(await checkExpiry(req))
    return res.sendStatus(401);

  get_profile(req, res);
})

app.post('/server/requests', (req, res) => {
  if (req.body.data.status == 'Fetching Requests') {
    console.log('Debug: Getting friend requests')
    findAllRequests(req, res);
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


app.get('/',(req, res) => {
  res.render("index");
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'yoshi-react/build', 'index.html'));
});


app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
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

// Parsers
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Swagger.io
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require('swagger-jsdoc');
const {options} = require('./openAPI/options.js');

// dotenv
require('dotenv').config();

// Setup
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const path = require('path');

// Routing functions
const { authAuthor, checkUsername, removeLogin, checkExpiry, sendCheckExpiry, checkAdmin } = require('./routes/auth');
const { register_author, get_profile } = require('./routes/author');
const { saveRequest, deleteRequest, findRequest, findAllRequests, senderAdded } = require('./routes/request');
const { addAuthor, deleteAuthor, modifyAuthor } = require('./routes/admin');
const { isFriend, unfriending, unfollowing } = require('./routes/relations');

// App uses
app.use(express.static(path.resolve(__dirname + '/yoshi-react/build'))); 
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());
app.set('views', path.resolve( __dirname, './yoshi-react/build'));

// Setting up database
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
mongoose.connect(process.env.ATLAS_URI, {dbName: "yoshi-connect"});
const { author_scheme } = require('./db_schema/authorSchema.js');
const database = mongoose.connection;
const Author = database.model('Author', author_scheme);

// Development check
if (process.env.NODE_ENV === "development") {
  app.use(express.static("./yoshi-react/build"));
}

// Swagger.io serve
const openapiSpecification = swaggerJsdoc(options);
app.use('/server/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(openapiSpecification)
);

app.get('/favicon.ico', (req, res) => {
  res.sendStatus(404);
})

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
  if (req.body.status == 'Is username in use') {
    console.log('Debug: Checking if the username is already taken')
    await checkUsername(req, res);
  } else {
    console.log('Debug: Signing up as an author')
    await register_author(req, res);
  }
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

/** Admin routing */ 
app.post('/server/admin', async (req, res) => {
  console.log('Debug: Login as Admin')
  await authAuthor(req, res);
})

app.get('/server/admin/dashboard', async (req, res) => {
  console.log('Debug: Checking expiry of token')
  if(await checkAdmin(req, res) === false){
    return res.sendStatus(403)
  }

  if((await checkExpiry(req, res)) == "Expired"){
    return res.json({
      status: false
    })
  }

  return res.json({
    status: true
  })
})

app.put('/server/admin/dashboard', (req, res) => {
  if (req.body.data.status == 'Add New Author') {
    console.log('Debug: Adding a new author');
    addAuthor(req, res);
  } else if (req.body.data.status == 'Modify an Author') {
    console.log('Debug: Modifying the Author')
    modifyAuthor(req, res);
  }
})

app.post('/server/admin/dashboard', async (req, res) => {
  if (req.body.status == 'Is username in use') {
    console.log('Debug: Checking if the username is already taken')
    await checkUsername(req, res);
  } else if (req.body.data.status == 'Logging Out') {
    console.log('Debug: Logging out as Admin')
    removeLogin(req, res);
  } else if (req.body.data.status == 'Fetching Authors') {
    console.log('Debug: Getting all authors')
    return res.json({
      authors: await Author.find()
    })
  }
})

app.delete('/server/admin/dashboard', (req, res) => {
  if (req.body.status == 'Delete an Author') {
    console.log('Debug: Deleting an Author');
    deleteAuthor(req, res);
  }
})

/** Public feed routing */
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

/** Profile routing */
app.get('/server/users/:username', async (req,res) => {
  let isExpired = await checkExpiry(req);
  if(isExpired  == "Expired") { return res.sendStatus(401); }
  get_profile(req, res);
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

/** Requests routing */
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

/** General routing */
app.get('/',(req, res) => {
  res.render("index");
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'yoshi-react/build', 'index.html'));
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

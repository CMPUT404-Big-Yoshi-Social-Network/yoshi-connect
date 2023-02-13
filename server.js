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
require('dotenv').config()
mongoose.set('strictQuery', true);

// Setting up app
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const path = require('path');
const { authAuthor, authAdmin } = require('./auth')
const { register_author } = require('./routes/author');
const { author_scheme } = require('./db_schema/author_schema.js');

app.use(express.static('yoshi-react/public')); // rendering static pages
app.use(bodyParser.urlencoded({extended: true}));
app.set('views', path.resolve( __dirname, './yoshi-react/public'));

//Connect to database
mongoose.connect(process.env.ATLAS_URI, {dbName: "yoshi-connect"});
const database = mongoose.connection
const Author = database.model('Author', author_scheme);

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../yoshi-react/build')));

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../yoshi-react/build', 'index.html'));
});

// Home page 
app.get('/',(req, res) => {
  console.log("Debug: Showing Home page");
  res.render("index");
});

// Sign up page 
app.post('/signup', (req, res) => {
  console.log('Debug: Signing up as an author')
  register_author(req, res);
})

// Log in page
app.post('/login', (req, res) => {
  console.log('Debug: Login as Author')

  authAuthor(req, res);
})
// TODO: SHOULD MOVE FROM /LOGIN TO PUBLIC FEED 200 OK ON /TEST FOR EXAMPLE!

app.use(getAuthor) // Checks if the author exists first then proceeds to other pages

// "public" feed seen after logging in 
app.get('/feed', authAuthor, (req, res) => {
  console.log("Debug: Showing a test page only accessible if you are an author");
  res.send('Hello, you are signed in.')
});

// Admin page
app.get('/admin', authAuthor, authAdmin(true), (req, res) => {
  console.log("Debug: Showing Admin page")
  res.send('Hello fellow Admin!')
});

/* Middleware */

// Authentication: Checking if the person is an author
async function getAuthor(req, res, next) {
  if (req.body.username != undefined) {
    console.log('Debug: Getting the username in the database.')
    await Author.findOne({username: req.body.username}, function(err, author){
      req.author = author;
    }).clone();
    if (req.author == null) {
      return false;
    } else {
      return req.body.username;
    }
  }
  if( next ) 
    next();
  return undefined;
}

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

module.exports={
  getAuthor
}
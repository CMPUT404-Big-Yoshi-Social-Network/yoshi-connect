/*
Copyright 2013 Kezziah Camille Ayuno, Alinn Martinez, Tommy Sandanasamy, Allan Ma, Omar Niazie

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

const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const path = require('path');
const { authAuthor, authAdmin } = require('./auth')

app.use(express.static('yoshi-react/public')); // rendering static pages

// HARDCODED TO ALWAYS WORK!! FIX W/ DB!
adminToken = 12345

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
  res.render("signup/index")
})
// TODO: SAVE THE DATA FROM THE SIGN UP!

// Log in page
app.post('/login', (req, res) => {
  console.log('Debug: Login as Author')
  res.render("login/index")
})
// TODO: SHOULD MOVE FROM /LOGIN TO PUBLIC FEED 200 OK ON /TEST FOR EXAMPLE!

app.use(getAuthor) // Checks if the author exists first then proceeds to other pages 

// Some test page you see after logging in 
app.get('/test', authAuthor, (req, res) => {
  console.log("Debug: Showing a test page only accessible if you are an author");
  res.send('Hello, you are signed in.')
});

// Admin page
app.get('/admin', authAuthor, authAdmin(adminToken), (req, res) => {
  console.log("Debug: Showing Admin page")
  res.send('Hello fellow Admin!')
});

/* Middleware */

// Authentication: Checking if the person is an author
function getAuthor(req, res, next) {
  const authorId = req.body.authorId
  if (authorId) {
    console.log('Debug: Getting the authorId in the database.')
    // TODO: Get the correct authorid to verify that the person is an author (save this author as req.author -> used in auth.js)
  }
  next()
}

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

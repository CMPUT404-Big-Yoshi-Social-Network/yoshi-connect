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
const { authAuthor, removeLogin, checkExpiry } = require('./auth')
const { register_author } = require('./routes/author');
const { author_scheme } = require('./db_schema/author_schema.js');

app.use(express.static('yoshi-react/public')); // rendering static pages
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.json());
app.set('views', path.resolve( __dirname, './yoshi-react/public'));

// Connect to database
mongoose.connect(process.env.ATLAS_URI, {dbName: "yoshi-connect"});
const database = mongoose.connection

// Sign up page 
app.post('/signup', (req, res) => {
  console.log('Debug: Signing up as an author')
  register_author(req, res);
})

// Login page
app.post('/login', (req, res) => {
  console.log('Debug: Login as Author')
  authAuthor(req, res);
})

// Admin Login page
app.post('/admin', (req, res) => {
  console.log('Debug: Login as Admin')
  authAuthor(req, res);
})

app.post('/admin/dashboard', (req, res) => {
  console.log('Debug: Logging out as Admin')
  removeLogin(req, res);
})

app.post('/feed', (req, res) => {
  if (req.body.data.message == 'Logging Out') {
    console.log('Debug: Logging out as Author')
    removeLogin(req, res);
  } else if (req.body.data.message == 'Checking expiry') {
    console.log('Debug: Checking expiry of token')
    checkExpiry(req, res);
  }
})

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
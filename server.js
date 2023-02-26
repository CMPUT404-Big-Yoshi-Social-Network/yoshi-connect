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
require('dotenv').config()
mongoose.set('strictQuery', true);

// Setting up app
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const path = require('path');
const { authAuthor, checkUsername, removeLogin, checkExpiry, sendCheckExpiry, checkAdmin } = require('./auth')
const { register_author, get_profile } = require('./routes/author');

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
  console.log(req)
  if (req.body.status == 'Is username in use') {
    console.log('Debug: Checking if the username is already taken')
    await checkUsername(req, res);
  } else {
    console.log('Debug: Signing up as an author')
    await register_author(req, res);
  }
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
  if(await checkAdmin(req, res) === false){
    return res.sendStatus(403)
  }

  if((await checkExpiry(req, res)) == "Expired"){
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

app.get('/server/users/:username', async (req,res) => {
  let a = await checkExpiry(req);
  if(a  == "Expired"){
    return res.sendStatus(401);
  };
  get_profile(req, res);
})

app.post('/server/users/:username', (req, res) => {
  if (req.body.data.message == 'Logging Out') {
    console.log('Debug: Logging out as Author')
    removeLogin(req, res);
  } else if (req.body.data.status == 'Save Request') {
    console.log('Debug: Saving Friend Request')
  } else if (req.body.data.status == 'Delete Request') {
    console.log('Debug: Deleting Friend Request')
  }
})

app.get('/',(req, res) => {
  res.render("index");
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'yoshi-react/build', 'index.html'));
});


app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
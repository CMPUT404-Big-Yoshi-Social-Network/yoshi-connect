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
require('dotenv').config();
mongoose.connect(process.env.ATLAS_URI, {dbName: "yoshi-connect"}).catch(err => console.log(err));

// Parser
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');



// App Setup
const express = require('express');
const app = express();
var cors = require('cors');
const PORT = process.env.PORT || 8080;
const path = require('path');

// Middleware
const signup = require('./api/signup');
const login = require('./api/login');
const admin = require('./api/admin');
const followers = require('./api/follower');
const followings = require('./api/following');
const profile = require('./api/profile');
const friends = require('./api/friend');
const apiDocs = require('./api/swagger');
const author = require('./api/author');
const comment = require('./api/comment');
const friend = require('./api/friend');
const inbox = require('./api/inbox');
const post = require('./api/post');
const setting = require('./api/settings');
const userinfo = require('./api/userinfo');
const node = require('./api/node');

// App Uses
app.use(express.json({limit: '10mb'}));
app.use(express.static(path.resolve(__dirname + '/yoshi-react/build'))); 
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());
app.use(cors());
app.set('views', path.resolve( __dirname, './yoshi-react/build'));

// Routing
app.use("/authors", author);
app.use("/authors/:authorId/posts/:postId/comments", comment);
app.use("/authors/:authorId/friends", friend);
app.use("/authors/:authorId/inbox", inbox);
app.use("/authors/:authorId/posts", post);
app.use("/settings", setting);
app.use("/signup", signup);
app.use("/login", login);
app.use("/admin", admin);
app.use("/authors/:authorId/followers", followers);
app.use("/authors/:authorId/followings", followings);
app.use("/profile/:username", profile);
app.use("/authors/:authorId/friends", friends);
app.use("/api-docs", apiDocs);
app.use("/userinfo", userinfo);
app.use("/nodes", node);

if (process.env.NODE_ENV === "development") { app.use(express.static("./yoshi-react/build")); }

app.get('/favicon.ico', (req, res) => { res.sendStatus(404); })

app.get('/',(req, res) => {
  res.render("index");
}); 

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'yoshi-react/build', 'index.html'));
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

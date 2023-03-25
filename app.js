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
const requests = require('./api/request');
const apiDocs = require('./api/swagger');
const author = require('./api/author');
const comment = require('./api/comment');
const friend = require('./api/friend');
const inbox = require('./api/inbox');
const post = require('./api/post');
const setting = require('./api/settings');
const userinfo = require('./api/userinfo');

// App Uses
app.use(express.static(path.resolve(__dirname + '/yoshi-react/build'))); 
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());
app.set('views', path.resolve( __dirname, './yoshi-react/build'));

// Routing
app.use("/authors", author);
app.use("/authors/:authorId/posts/:postId/comments", comment);
app.use("/authors/:authorId/friends", friend);
app.use("/authors/:author_id/inbox", inbox);
app.use("/authors/:authorId/posts", post);
app.use("/settings", setting);
app.use("/signup", signup);
app.use("/login", login);
app.use("/admin", admin);
app.use("/authors/:authorId/followers", followers);
app.use("/authors/:authorId/followings", followings);
app.use("/profile/:username", profile);
app.use("/authors/:authorId/friends", friends);
app.use("/authors/:authorId/requests", requests);
app.use("/api-docs", apiDocs);
app.use("/userinfo", userinfo);

if (process.env.NODE_ENV === "development") { app.use(express.static("./yoshi-react/build")); }

app.get('/favicon.ico', (req, res) => { res.sendStatus(404); })

app.get('/',(req, res) => {
  res.render("index");
}); 

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'yoshi-react/build', 'index.html'));
});

module.exports = app;
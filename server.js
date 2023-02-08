const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config()
const app = express();
const PORT = process.env.PORT || 8080;
const path = require('path');

app.use(express.static('yoshi-react/public')); // rendering static pages

//Connect to database
mongoose.connect(process.env.ATLAS_URI);
const database = mongoose.connection

// Test Router
const testRouter = require('./routes/test');
app.use('/test', testRouter);

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../yoshi-react/build')));

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../yoshi-react/build', 'index.html'));
});

// Homepage 
app.get('/',(request, response) => {
    console.log("Debug: GET");
    response.render("index");
});

// Test post request
app.post("/post", (req, res) => {
    console.log("Connected to React");
    res.redirect("/");
  });


app.listen(PORT, console.log(`Server listening on port ${PORT}`));

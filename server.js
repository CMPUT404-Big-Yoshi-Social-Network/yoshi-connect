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

app.use(express.static('yoshi-react/public')); // rendering static pages

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../yoshi-react/build')));

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../yoshi-react/build', 'index.html'));
});

// Homepage 
app.get('/',(req, res) => {
  console.log("Debug: Showing Home page");
  res.render("index");
});

app.get('/admin',(req, res) => {
  console.log("Debug: Showing Admin page")
  res.send('Hello fellow Admin!')
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

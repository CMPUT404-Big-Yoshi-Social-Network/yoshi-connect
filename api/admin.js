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

// Routing Functions 
const { authAuthor, removeLogin, checkExpiry, checkAdmin } = require('../routes/auth');
const { addAuthor, modifyAuthor, deleteAuthor } = require('../routes/admin');

// Schemas
// Schemas
const { Author } = require('../scheme/author.js');

// Router Setup
const express = require('express'); 

// Router
const router = express.Router();

router.post('/', async (req, res) => { await authAuthor(req, res); })

router.get('/dashboard', async (req, res) => {
  if(!(await checkAdmin(req, res))){ return res.sendStatus(403) }
  if((await checkExpiry(req, res))){ return res.sendStatus(401) }
  return res.sendStatus(200)
})

router.post('/dashboard', async (req, res) => {
  if (req.body.data.status == 'Logging Out') {
    removeLogin(req, res);
  } else if (req.body.data.status == 'Fetching') {
    const authors = await Author.find()
    if (!authors) { return res.sendStatus(404) }
    return res.json({
      authors: authors
    })
  }
})

router.delete('/dashboard', (req, res) => {
  if (req.body.status == 'Delete') {
    console.log('Debug: Deleting an Author.');
    deleteAuthor(req, res);
  }
})

router.put('/dashboard', (req, res) => {
  if (req.body.data.status == 'Add New Author') {
    console.log('Debug: Adding a new Author.');
    addAuthor(req, res);
  } else if (req.body.data.status == 'Modify') {
    console.log('Debug: Modifying the Author.')
    modifyAuthor(req, res);
  }
})

module.exports = router;
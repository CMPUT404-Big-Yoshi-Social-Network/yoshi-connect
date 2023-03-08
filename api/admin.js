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
const { authAuthor, removeLogin, checkExpiry, checkAdmin } = require('./routes/auth');
const { addAuthor, modifyAuthor, deleteAuthor } = require('./routes/admin');


app.post('/server/admin', async (req, res) => {
    console.log('Debug: Login as Admin')
    await authAuthor(req, res);
  })
  
  app.get('/server/admin/dashboard', async (req, res) => {
    console.log('Debug: Checking expiry of token')
    if(!(await checkAdmin(req, res))){
      return res.sendStatus(403)
    }
  
    if((await checkExpiry(req, res))){
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
  
  app.post('/server/admin/dashboard', async (req, res) => {
    if (req.body.data.status == 'Logging Out') {
      console.log('Debug: Logging out as Admin')
      removeLogin(req, res);
    } else if (req.body.data.status == 'Fetching Authors') {
      console.log('Debug: Getting all authors.')
      return res.json({
        authors: await Author.find()
      })
    }
  })
  
  app.delete('/server/admin/dashboard', (req, res) => {
    if (req.body.status == 'Delete an Author') {
      console.log('Debug: Deleting an Author.');
      deleteAuthor(req, res);
    }
  })
  
  app.put('/server/admin/dashboard', (req, res) => {
    if (req.body.data.status == 'Add New Author') {
      console.log('Debug: Adding a new Author.');
      addAuthor(req, res);
    } else if (req.body.data.status == 'Modify an Author') {
      console.log('Debug: Modifying the Author.')
      modifyAuthor(req, res);
    }
  })
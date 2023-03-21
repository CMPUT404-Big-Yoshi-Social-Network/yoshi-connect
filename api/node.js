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
const { authAuthor } = require('../routes/auth');

// Router Setup
const express = require('express'); 

// Router
const router = express.Router({mergeParams: true});

router.get('/incoming', async (req, res) => { 
    // Getting our credentials from other nodes
    await getCreds(req.cookies.token); 
})

router.get('/outgoing', async (req, res) => { 
    // Getting other nodes' credentials from us 
    await getCreds(req.cookies.token); 
})

router.get('/incoming/:credId', async (req, res) => { 
    // Getting our credentials from other nodes given the credId
    await getCred(req.cookies.token, req.params.credId); 
})

router.get('/outgoing/:credId', async (req, res) => { 
    // Getting their credentials from us given the credId
    await getCred(req.cookies.token, req.params.credId); 
})

router.post('/outgoing', async (req, res) => {
    // Creating credentials for a node 
    await postCred(token); 
})

router.post('/incoming', async (req, res) => {
    // Storing credentials from other nodes 
    await postCred(token); 
})

router.put('/outgoing', async (req, res) => {
    // Modifying credentials for a node 
    await putCred(token); 
})

router.delete('/outgoing/:credId', async (req, res) => { 
    // Deleting credentials for a node given the credId
    await deleteCred(token, req.params.credId); 
})

router.delete('/incoming/:credId', async (req, res) => { 
    // Deleting credentials for us (in database)
    await deleteCred(token, req.params.credId); 
})

module.exports = router;
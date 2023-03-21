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

router.get('/', async (req, res) => { 
    await getCreds(req, res); 
})

router.get('/:credId', async (req, res) => { 
    await getCred(token, req.params.credId); 
})

router.post('/', async (req, res) => {
    await postCred(token); 
})

router.delete('/:credId', async (req, res) => { 
    await deleteCred(token, req.params.credId); 
})

//Later
router.post('/', async (req, res) => {
    await authAuthor(req, res); 
})

module.exports = router;
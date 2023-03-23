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

// Router Setup
const express = require('express'); 

// Routing Functions 
const { getCreds, getCred, postCred, putCred, allowNode, deleteCred } = require('../routes/node');
const { OutgoingCredentials } = require('../scheme/server');
const http = require('http');
const axios = require('axios');

// Router
const router = express.Router({mergeParams: true});

router.get('/incoming', async (req, res) => { 
    // Getting our credentials from other nodes
    let page = req.query.page;
    let size = req.query.size;
  
    if (page == undefined) page = 1;
    if (size == undefined) size = 5;
    await getCreds(res, page, size, req.cookies.token, 'incoming'); 
})

router.get('/outgoing', async (req, res) => { 
    // Getting other nodes' credentials from us 
    let page = req.query.page;
    let size = req.query.size;
  
    if (page == undefined) page = 1;
    if (size == undefined) size = 5;
    await getCreds(res, page, size, req.cookies.token, 'outgoing'); 
})

router.get('/outgoing/authors', async (req, res) => {
    //const outgoings = await OutgoingCredentials.find().clone();

    const outgoings = await OutgoingCredentials.find().clone();
    
    let authors = '';

    var config = {
        host: outgoings[0].url,
        url: outgoings[0].url + 'authors',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    await axios.request(config)
    .then( res => {
        //console.log(res.data);
        authors = res.data;
    })
    .catch( error => {
        console.log(error);
    })
    
    console.log(authors);
    return res.sendStatus(200);
})

router.get('/incoming/:credId', async (req, res) => { 
    // Getting our credentials from other nodes given the credId
    await getCred(res, req.cookies.token, req.params.credId, 'incoming'); 
})

router.get('/outgoing/:credId', async (req, res) => { 
    // Getting their credentials from us given the credId
    await getCred(res, req.cookies.token, req.params.credId, 'outgoing'); 
})

router.post('/outgoing', async (req, res) => {
    // Creating credentials for a node 
    await postCred(req, res, req.cookies.token, 'outgoing'); 
})

router.post('/incoming', async (req, res) => {
    // Storing credentials from other nodes 
    await postCred(req, res, req.cookies.token, 'incoming'); 
})

router.put('/outgoing/:credId', async (req, res) => {
    // Modifying credentials for a node 
    if (req.body.status == 'modify') {
        await putCred(req, res, req.params.credId, req.cookies.token, 'outgoing'); 
    } else {
        await allowNode(res, req.params.credId, 'outgoing');
    }
})

router.put('/incoming/:credId', async (req, res) => {
    if (req.body.status == 'modify') {
        await putCred(req, res, req.params.credId, req.cookies.token, 'incoming'); 
    } else {
        await allowNode(res, req.params.credId, 'incoming');
    }
})

router.delete('/outgoing/:credId', async (req, res) => { 
    // Deleting credentials for a node given the credId
    await deleteCred(req.cookies.token, req.params.credId, 'outgoing'); 
})

router.delete('/incoming/:credId', async (req, res) => { 
    // Deleting credentials for us (in database)
    await deleteCred(req.cookies.token, req.params.credId, 'incoming'); 
})

module.exports = router;
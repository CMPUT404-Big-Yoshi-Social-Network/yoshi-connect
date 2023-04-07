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
const axios = require('axios');
const { addFollowing } = require('../routes/friend');

// OpenAPI
const {options} = require('../openAPI/options.js');

// Swaggerio
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require('swagger-jsdoc');
const openapiSpecification = swaggerJsdoc(options);

// Router
const router = express.Router({mergeParams: true});

router.get('/outgoing', async (req, res) => { 
    let page = req.query.page;
    let size = req.query.size;
  
    if (page == undefined) page = 1;
    if (size == undefined) size = 5;
    await getCreds(res, page, size, req.cookies.token, 'outgoing'); 
})

router.get('/outgoing/authors', async (req, res) => {
    const outgoings = await OutgoingCredentials.find().clone();
    
    let authors = [];

    for (let i = 0; i < outgoings.length; i++) {
        if (outgoings[i].allowed) {
            const auth = outgoings[i].auth === 'userpass' ? { username: outgoings[i].displayName, password: outgoings[i].password } : outgoings[i].auth
            if (outgoings[i].auth === 'userpass') {
                var config = {
                    host: outgoings[i].url,
                    url: outgoings[i].url + '/authors/',
                    method: 'GET',
                    auth: auth,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
            } else {
                if (outgoings[i].url === 'https://bigger-yoshi.herokuapp.com/api') {
                    var config = {
                      host: outgoings[i].url,
                      url: outgoings[i].url + '/authors/',
                      method: 'GET',
                      headers: {
                          'Authorization': auth,
                          'Content-Type': 'application/json'
                      }
                    };          
                } else {
                    var config = {
                        host: outgoings[i].url,
                        url: outgoings[i].url + '/authors',
                        method: 'GET',
                        headers: {
                            'Authorization': auth,
                            'Content-Type': 'application/json'
                        }
                    };
                }
            }
    
            await axios.request(config)
            .then( res => {
                let items = []
                if (outgoings[i].auth === 'userpass') {
                    items = res.data.results
                } else {
                    items = res.data.items
                }
                authors = authors.concat(items);
            })
            .catch( error => { })
        }
    }
    return res.json({
        'type': 'authors',
        items: authors
    })
})

router.get('/outgoing/:credId', async (req, res) => { 
    await getCred(res, req.cookies.token, req.params.credId, 'outgoing'); 
})

router.put('/outgoing/:credId', async (req, res) => {
    if (req.body.status == 'modify') {
        await putCred(req, res, req.params.credId, req.cookies.token, 'outgoing'); 
    } else {
        await allowNode(res, req.params.credId, 'outgoing');
    }
})

router.post('/outgoing', async (req, res) => {
    await postCred(req, res, req.cookies.token, 'outgoing'); 
})

router.delete('/outgoing/:credId', async (req, res) => { 
    await deleteCred(req.cookies.token, req.params.credId, 'outgoing'); 
})

router.post('/outgoing/authors/:authorId/inbox/:type', async (req, res) => {
    if(req == undefined || req.body == undefined || req.body.actor == undefined || req.body.object == undefined){
        return res.sendStatus(400);
    }

    const outgoings = await OutgoingCredentials.find().clone();

    for (let i = 0; i < outgoings.length; i++) {
        if (outgoings[i].allowed) {
            const auth = outgoings[i].auth
            var config = {
                host: outgoings[i].url,
                url: outgoings[i].url + '/authors/' + req.params.authorId + '/inbox',
                method: 'POST',
                headers: {
                    'Authorization': auth,
                    'Content-Type': 'application/json'
                },
                data: {
                    type: req.params.type,
                    ...req.body
                }
            };
            await addFollowing(req.body.actor, req.body.object);
            await axios.request(config)
            .then( res => { })
            .catch( error => { console.log('The inbox is not from this server.') })
        }
    }

    return res.sendStatus(200);
})

router.get('/incoming', async (req, res) => { 
    let page = req.query.page;
    let size = req.query.size;
  
    if (page == undefined) page = 1;
    if (size == undefined) size = 5;
    await getCreds(res, page, size, req.cookies.token, 'incoming'); 
})

router.get('/incoming/:credId', async (req, res) => { 
    await getCred(res, req.cookies.token, req.params.credId, 'incoming'); 
})

router.post('/incoming', async (req, res) => {
    await postCred(req, res, req.cookies.token, 'incoming'); 
})

router.put('/incoming/:credId', async (req, res) => {
    if (req.body.status == 'modify') {
        await putCred(req, res, req.params.credId, req.cookies.token, 'incoming'); 
    } else {
        await allowNode(res, req.params.credId, 'incoming');
    }
})

router.delete('/incoming/:credId', async (req, res) => { 
    await deleteCred(req.cookies.token, req.params.credId, 'incoming'); 
})

module.exports = router;
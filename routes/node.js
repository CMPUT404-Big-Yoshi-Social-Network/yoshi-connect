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

const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

// Schemas
const { OutgoingCredentials, IncomingCredentials } = require('../scheme/server.js');
const { Login } = require('../scheme/author.js');

// UUID
const crypto = require('crypto');

// Password
const crypto_js = require('crypto-js');

async function getCreds(res, page, size, token, type) {
	/**
    Description: Gets all incoming nodes which remote servers use to communicate
    Associated Endpoint: /nodes/incoming
						 /nodes/outgoing
    Request Type: GET
    Request Body: { token: 5yy7bCMPrSXSv9knpS4gfz }
    Return: 403 Status (Forbidden) -- Author does not have access rights
			200 Status (OK) -- Returns a JSON containing an empty array or array with sanitized nodes
								{ type: nodes,
								items: [ { "type": "node",
                						    	"id" : https://yoshi-connect.herokuapp.com/nodes/29c546d45f564a27871838825e3dbecb
												"host": https://yoshi-connect.herokuapp.com/,
												"displayName": abc,
												"url":  https://yoshi-connect.herokuapp.com/nodes/29c546d45f564a27871838825e3dbecb } ]
    */
	let coll = null
	if (type == 'incoming') {
		coll = IncomingCredentials;
	} else if (type == 'outgoing') {
		coll = OutgoingCredentials;
	}
	const login = await Login.findOne({token: token}).clone();
	if (!login.admin) { return res.sendStatus(403); }
	let items = undefined;

    if (page > 1) { 
        items = await coll.find().skip((page-1) * size).limit(size); 
    } else if (page == 1) {
        items = await coll.find().limit(size);
    } else {
		return res.json({
			'type': 'nodes',
			items: []
		})
    }

    if (!items || items.length == 0) { 
		return res.json({
			'type': 'nodes',
			items: []
		})
	}
    
    let sanitizedItems = [];

    for(let i = 0; i < items.length; i++){
        const item = items[i];
        sanitizedItems.push({
                "type": "node",
                "id" : process.env.DOMAIN_NAME + "nodes/" + item._id,
                "host": process.env.DOMAIN_NAME,
                "displayName": item.displayName,
                "url":  process.env.DOMAIN_NAME + "nodes/" + item._id
        })
    }
    return res.json({
		'type': 'nodes',
		items: items
	})
}

async function getCred(res, token, credId, type) {
	/**
    Description: Gets a specific incoming or outgoing node to communicate with a specific server
    Associated Endpoint: /nodes/incoming/:credId
						 /nodes/outgoing/:credId
    Request Type: GET
    Request Body: { token: 5yy7bCMPrSXSv9knpS4gfz, _id: 67c43c5cc6484d4c9197153328849d0f })
    Return: 403 Status (Forbidden) -- Author does not have access rights
			200 Status (OK) -- Returns JSON with
									{ type: 'node',
										node: { _id: 67c43c5cc6484d4c9197153328849d0f
												displayName: "abc"
												url: "http://localhost:3000/api"
												pasword: "abc"
												allowed: false
												auth: "Basic 29c546d45f564a27871838825e3dbecb" } }
    */
	let coll = null
	if (type == 'incoming') {
		coll = IncomingCredentials;
	} else if (type == 'outgoing') {
		coll = OutgoingCredentials;
	}
	const login = await Login.findOne({token: token}).clone();
	if (!login.admin) { return res.sendStatus(403); }
	const node = await coll.findOne({_id: credId}).clone();
	if (node) {
		return res.json({
			type: 'node',
			node: node
		});
	} else {
		return res.json({
			type: 'node',
			node: null
		})
	}
}

async function postCred(req, res, token, type) {
	/**
    Description: Stores incoming / outgoing node (nodes used to communicate with our server)
    Associated Endpoint: /nodes/incoming
						 /nodes/outgoing
    Request Type: POST
    Request Body: { auth: "Basic abc:abc" }
    Return: 403 Status (Forbidden) -- Author does not have access rights
			200 Status (OK) -- Returns JSON with
									{ type: 'node',
										node: { _id: 67c43c5cc6484d4c9197153328849d0f
												displayName: "abc"
												url: "http://localhost:3000/api"
												pasword: "abc"
												allowed: false
												auth: "Basic 29c546d45f564a27871838825e3dbecb" } }
    */
	let coll = null
	let auth = null
	if (type == 'incoming') {
		coll = IncomingCredentials;
		auth = 'Basic ' + btoa(req.body.username + ':' + req.body.password);
	} else if (type == 'outgoing') {
		coll = OutgoingCredentials;
	}
	const login = await Login.findOne({token: token}).clone();
	if (!login.admin) { return res.sendStatus(403); }
	let uuid = String(crypto.randomUUID()).replace(/-/g, "");
	const node = new coll({
		_id: uuid,
		displayName: req.body.username,
		url: req.body.host,
		password: crypto_js.SHA256(req.body.password),
		allowed: false,
		auth: auth != null ? auth : req.body.auth
	})
	await node.save();
	return res.json({
		type: 'node',
		node: node
	})
}

async function putCred(req, res, credId, token, type) {
	/**
    Description: Modifies an existing node that communicates with other servers or enables / disables this node
    Associated Endpoint: /nodes/outgoing/:credId
    Request Type: PUT
    Request Body: { displayName: "abc"
					password: "abc"
					url = "" })
    Return: 403 Status (Forbidden) --  Author does not have access rights
			404 Status (Not Found) -- Cred not found in database
			200 Status (OK) -- Returns JSON with
									{ type: 'node',
										node: { _id: 67c43c5cc6484d4c9197153328849d0f
												displayName: "abc"
												url: "http://localhost:3000/api"
												pasword: "abc"
												allowed: false
												auth: "Basic oJzOPEOFnoOWNfdNZsafNE39t" } }
    */
	let coll = null
	if (type == 'incoming') {
		coll = IncomingCredentials;
	} else if (type == 'outgoing') {
		coll = OutgoingCredentials;
	}
	const login = await Login.findOne({token: token}).clone();
	if (!login.admin) { return res.sendStatus(403); }
	const node = await coll.findOne({_id: credId}).clone();
	if (!node) { res.sendStatus(404); }
	node.displayName = req.body.newUsername
	node.password = crypto_js.SHA256(req.body.newPassword)
	node.url = req.body.newHost
	await node.save();
	return res.json({
		type: 'node',
		node: node
	})
}

async function deleteCred(token, credId, type) {
	/**
    Description: Deletes an existing incoming / outgoing node from the database
    Associated Endpoint: /nodes/incoming/:credId
						 /nodes/outgoing/:credId
    Request Type: DELETE
    Request Body: { _id: 67c43c5cc6484d4c9197153328849d0f }
    Return: 403 Status (Forbidden) --  Author does not have access rights
			500 Status (Internal Server Error) -- Unable to delete Cred from database
			204 Status (No Content) -- Cred was successfully deleted from database
    */
	let coll = null
	if (type == 'incoming') {
		coll = IncomingCredentials;
	} else if (type == 'outgoing') {
		coll = OutgoingCredentials;
	}
	const login = await Login.findOne({token: token}).clone();
	if (!login.admin) { return res.sendStatus(403); }
	coll.deleteOne({_id: credId}, function(err, login) {
		if (err) throw res.sendStatus(500);
		return res.sendStatus(204)
	})
}

async function allowNode(res, credId, type){
	/**
    Description: 
    Associated Endpoint: /nodes/incoming/:credId
						 /nodes/outgoing/:credId
    Request Type: PUT
    Request Body: { _id: 67c43c5cc6484d4c9197153328849d0f }
    Return: 200 Status (OK) -- Cred was successfully enabled / disabled
    */
	let coll = null
	if (type == 'incoming') {
		coll = IncomingCredentials;
	} else if (type == 'outgoing') {
		coll = OutgoingCredentials;
	}
    const node = await coll.findOne({_id: credId}).clone();
    if (node.allowed) {
        node.allowed = false;
    } else {
        node.allowed = true;
    }
    node.save();
    return res.sendStatus(200)
}

module.exports = {
	getCreds,
	getCred,
	postCred,
	putCred,
	deleteCred,
	allowNode
}
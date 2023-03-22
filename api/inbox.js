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
const { getInbox, postInboxLike, deleteInbox, postInboxPost, postInboxComment, postInboxRequest} = require('../routes/inbox')

// Router Setup
const express = require('express'); 
const { IncomingCredentials } = require('../scheme/server');
const { authLogin } = require('../routes/auth');

// Router
const router = express.Router({mergeParams: true});

router.get('/', async (req, res) => {
	const [posts, status] = await getInbox(req.cookies.token, req.params.authorId, req.query.size, req.query.page); 

	if(status != 200){
		return res.sendStatus(status);
	}

	return res.json(posts);
})

router.post('/', async (req, res) => {

	let authorized = false;
	//If req.headers.authorization is set then process it
	if(req.headers.authorization){
		const authHeader = req.headers.authorization;

		const [scheme, data] = authHeader.split(" ");
		if(scheme === "Basic") {
			const credential = Buffer.from(data, 'base64').toString('ascii');
			const [serverName, password] = credential.split(":");
			if( await IncomingCredentials.findOne({displayName: serverName, password: password})) {
				authorized = true;
			}
		}
	}

	if(req.cookies.token && !authorized){
		let authorId;
		const token = req.cookies.token;
		if(!token){
			return res.sendStatus(401);
		}

		if(req.body.type == "comment" || req.body.type == "post" || req.body.type == "like"){
			authorId = req.body.author.id;
		}
		else if(req.body.type == "follow"){
			authorId = req.body.actor.id;
		}
		else{
			return res.sendStatus(400);
		}

		if(authLogin(token, authorId)){
			authorized = true;
		}
	}

	if(!authorized){
		res.set("WWW-Authenticate", "Basic realm=\"ServerToServer\", charset=\"ascii\"");
		return res.sendStatus(401);
	}

	const type = req.body.type;
	if(type === "post"){
		//For other servers to send their authors posts to us
		await postInboxPost(req.body, req.params.authorId);
	}
	else if(type === "follow"){
		//For local/remote authors to server 
		await postInboxFollow(req.body);
	}
	else if(type === "like"){
		await postInboxLike(req.body, req.params.authorId);
	}
	else if(type === "comment"){
		await postInboxComment(req.body, req.params.authorId);
	}
	else{
		res.sendStatus(400);
	}
	return res.sendStatus(200);
})

router.delete('/', async (req, res) => {
	const status = await deleteInbox(req.cookies.token, req.params.authorId);

	return res.sendStatus(status);
})

module.exports = router;
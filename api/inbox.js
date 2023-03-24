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
const { sendRequest, deleteRequest, getRequests, getRequest } = require('../routes/request');
const { checkExpiry } = require('../routes/auth');

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

router.get('/requests', async (req, res) => {
	if (!req.cookies || await checkExpiry(req.cookies.token)) { return res.sendStatus(401); }
  
	const authorId = req.params.authorId;
	await getRequests(authorId, res);
})

router.delete('requests/:foreignAuthorId', async (req, res) => {
	const authorId = req.params.authorId;
	const foreignId = req.params.foreignAuthorId;
  
	await deleteRequest(authorId, foreignId, res);
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
			authorId = req.body.author.id.split("/");
			authorId = authorId[authorId.length - 1];
		}
		else if(req.body.type == "follow"){
			authorId = req.body.actor.id;
		}
		else{
			return res.sendStatus(400);
		}

		if( await authLogin(token, authorId)){
			authorized = true;
		}
	}

	if(!authorized){
		res.set("WWW-Authenticate", "Basic realm=\"ServerToServer\", charset=\"ascii\"");
		return res.sendStatus(401);
	}

	const type = req.body.type;
	let response, status;
	if(type === "post"){
		//For other servers to send their authors posts to us
		[response, status] = await postInboxPost(req.body, req.params.authorId);
	}
	else if(type === "follow"){
		//For local/remote authors to server 
		[response, status] = await postInboxFollow(req.body);
	}
	else if(type === "like"){
		[response, status] = await postInboxLike(req.body, req.params.authorId);
	}
	else if(type === "comment"){
		[response, status] = await postInboxComment(req.body, req.params.authorId);
	}
	else{
		res.sendStatus(400);
	}

	if(status != 200){
		return res.sendStatus(status);
	}

	if(type === "post"){
		//[response, status] = await postInboxPost(req.body, req.params.authorId);
	}
	else if(type === "follow"){
		
	}
	else if(type === "comment"){
		response = {
			type: "comment",
			author: response.author,
			comment: response.comment,
			contentType: response.contentType,
			published: response.published,
			id: response._id
		}
	}

	return res.json(response);
})

router.put('requests/:foreignAuthorId', async (req, res) => {
	const authorId = req.params.authorId;
	const foreignId = req.params.foreignAuthorId;
  
	const request = await sendRequest(authorId, foreignId, res);
  
	return res.json({
	  "type": request.type,
	  "summary": request.summary,
	  "actor": request.actor,
	  "object": request.object
	})
})

router.get('requests/:foreignAuthorId', async (req, res) => {
	const authorId = req.params.authorId;
	const foreignId = req.params.foreignAuthorId;
  
	const request = await getRequest(authorId, foreignId, res);
  
	return res.json({
	  "type": request.type,
	  "summary": request.summary,
	  "actor": request.actor,
	  "object": request.object
	})
})

router.delete('/', async (req, res) => {
	const status = await deleteInbox(req.cookies.token, req.params.authorId);

	return res.sendStatus(status);
})

module.exports = router;
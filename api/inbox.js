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
const { getInbox, postInboxLike, deleteInbox, postInboxPost, postInboxComment, postInboxRequest, sendToForeignInbox} = require('../routes/inbox')
const { sendRequest, deleteRequest, getRequests, getRequest } = require('../routes/request');
const { checkExpiry } = require('../routes/auth');

// OpenAPI
const {options} = require('../openAPI/options.js');

// Swaggerio
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require('swagger-jsdoc');
const openapiSpecification = swaggerJsdoc(options);

// Router Setup
const express = require('express'); 
const { IncomingCredentials, OutgoingCredentials } = require('../scheme/server');
const { authLogin } = require('../routes/auth');
const { Author } = require('../scheme/author');

// Router
const router = express.Router({mergeParams: true});

// TBA 200
/**
 * @openapi
 * /authors/:authorId/inbox:
 *  get:
 *    summary: Fetches an Author's inbox posts
 *    tags:
 *      - inbox 
 *    parameters:
 *      - in: path
 *        name: authorId
 *        schema:
 *          type: string
 *        description: id of an Author
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *        description: Page of the Inbox objects
 *      - in: query
 *        name: size
 *        schema:
 *          type: integer
 *        description: Size of the Inbox objects
 *    responses:
 *      400:
 *        description: Bad Request, no posts to get
 *      200: 
 *        description: OK, successfully fetches posts from Inbox
 */
router.get('/', async (req, res) => {
	const [posts, status] = await getInbox(req.cookies.token, req.params.authorId, req.query.page, req.query.size); 

	if (status != 200) { return res.sendStatus(status); }

	return res.json(posts);
})

// TBA 200
/**
 * @openapi
 * /authors/:authorId/inbox/requests:
 *  get:
 *    summary: Fetches an Author's inbox requests
 *    tags:
 *      - inbox 
 *    parameters:
 *      - in: path
 *        name: authorId
 *        schema:
 *          type: string
 *        description: id of an Author
 *    responses:
 *      400:
 *        description: Bad Request, no requests to get
 *      401:
 *        description: Unauthorized, token is not authorized or does not exist in cookies
 *      200: 
 *        description: OK, successfully fetches requests from Inbox
 */
router.get('/requests', async (req, res) => {
	if (!req.cookies || await checkExpiry(req.cookies.token)) { return res.sendStatus(401); }
  
	const authorId = req.params.authorId;
	await getRequests(authorId, res);
})

// TBA 200
/**
 * @openapi
 * /authors/:authorId/inbox/requests/:foreignAuthorId:
 *  delete:
 *    summary: Fetches an Author's inbox requests
 *    tags:
 *      - inbox 
 *    parameters:
 *      - in: path
 *        name: authorId
 *        schema:
 *          type: string
 *        description: id of an Author
 *      - in: path
 *        name: foreignAuthorId
 *        schema:
 *          type: string
 *        description: id of an foreign Author
 *    responses:
 *      400:
 *        description: Bad Request, no requests to get
 *      500: 
 *        description: Internal Server Error, could not find Actor or Object
 *      200: 
 *        description: OK, successfully deletes the request from Inbox
 */
router.delete('/requests/:foreignAuthorId', async (req, res) => {
	const authorId = req.params.authorId;
	const foreignId = req.params.foreignAuthorId;
  
	await deleteRequest(res, null, null, authorId, foreignId, 'reject', true)
})

// TBA 200
/**
 * @openapi
 * /authors/:authorId/inbox:
 *  post:
 *    summary: posts an object into the Author's inbox (comment, post, like, follow)
 *    tags:
 *      - inbox 
 *    parameters:
 *      - in: path
 *        name: authorId
 *        schema:
 *          type: string
 *        description: id of an Author
 *    responses:
 *      401:
 *        description: Unauthorized, no token or not authorized 
 *      400:
 *        description: Bad Request, no valid type specified in request
 *      200: 
 *        description: OK, successfully posts to the Inbox
 */
router.post('/', async (req, res) => {

	let authorized = false;
	if(req.headers.authorization){
		const authHeader = req.headers.authorization;
		const [scheme, data] = authHeader.split(" ");
		if(scheme === "Basic") {
			const credential = Buffer.from(data, 'base64').toString('ascii');
			const [serverName, password] = credential.split(":");
			if(await OutgoingCredentials.findOne({displayName: serverName, password: password}) || await IncomingCredentials.findOne({displayName: serverName, password: password})) {
				authorized = true;
			} 
		}
	} else {
		if (await authLogin(req.cookies.token, authorId)) {
			authorized = true;
		}
	}

	let authorId;
	if(req.body.type.toLowerCase() == "comment" || req.body.type.toLowerCase() == "post" || req.body.type.toLowerCase() == "like"){
		if (req.body.author !== undefined) {
			authorId = req.body.author.id.split("/");
			authorId = authorId[authorId.length - 1];
		} else {
			authorId = req.body.authorId;
		}
	}
	else if(req.body.type.toLowerCase() == "follow" || req.body.type.toLowerCase() == 'accept'){
		authorId = req.body.actor.id;
		authorId = authorId.split("/");
		authorId = authorId[authorId.length - 1];
	}
	else{
		return res.sendStatus(400);
	}

	//TODO fix this once and for all
	if(!authorized){
		res.set("WWW-Authenticate", "Basic realm=\"ServerToServer\", charset=\"ascii\"");
		return res.sendStatus(401);
	}

	
	const type = req.body.type.toLowerCase();
	let response, status;
	if(type === "post"){
		//For other servers to send their authors posts to us
		[response, status] = await postInboxPost(req.body, req.params.authorId);
	}
	else if(type === "follow" || type === 'accept'){
		//For local/remote authors to server 
		let actor = null;
		if (req.body.actor.status !== undefined) {
			let actorId = req.body.actor.id;
			actorId = actorId.split("/");
			actorId = actorId[actorId.length - 1];
			const actorDoc = await Author.findOne({_id: actorId});
			actor = {
				id: process.env.DOMAIN_NAME + "authors/" + actorDoc._id,
				host: process.env.DOMAIN_NAME,
				displayName: actorDoc.username,
				url: process.env.DOMAIN_NAME + "authors/" + actorDoc._id,
				github: actorDoc.github,
				profileImage: actorDoc.profileImage
			}
		} else {
			// remote
			actor = req.body.actor;
		}
		[response, status] = await postInboxRequest(actor, req.body.object, req.params.authorId, type);
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
	else if (type === "follow" || type === 'accept') {
		response = {
			type: type,
			summary: response.summary,
			actor: response.actor,
			object: response.object
		}
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

// TBA 200
/**
 * @openapi
 * /authors/:authorId/inbox/requests/:foreignAuthorId:
 *  get:
 *    summary: creates a request and saves it into the inbox
 *    tags:
 *      - inbox 
 *    parameters:
 *      - in: path
 *        name: authorId
 *        schema:
 *          type: string
 *        description: id of an Author
 *      - in: path
 *        name: foreignAuthorId
 *        schema:
 *          type: string
 *        description: id of an foreign Author
 *    responses:
 *      404:
 *        description: Not Found, follow request was not found 
 *      200: 
 *        description: OK, successfully finds the follow request
 */
router.get('/requests/:foreignAuthorId', async (req, res) => {
	const authorId = req.params.authorId;
	const foreignId = req.params.foreignAuthorId;
  
	const request = await getRequest(authorId, foreignId);

	if (!request) { 
		return res.json({
			"type": 'follow',
			"summary": 'No request found',
			"actor": null,
			"object": null
		  })
	} else {
		return res.json({
			"type": request.goal,
			"summary": request.actor + ' wants to ' + request.goal + ' ' + request.object,
			"actor": request.actor,
			"object": request.object
		  })
	}
})

/**
 * @openapi
 * /authors/:authorId/inbox:
 *  delete:
 *    summary: creates a request and saves it into the inbox
 *    tags:
 *      - inbox 
 *    parameters:
 *      - in: path
 *        name: authorId
 *        schema:
 *          type: string
 *        description: id of an Author
 *      - in: path
 *        name: foreignAuthorId
 *        schema:
 *          type: string
 *        description: id of an foreign Author
 *    responses:
 *      200: 
 *        description: OK, successfully deletes the request from the Inbox
 *      500: 
 *        description: Internal Server Error, no Actor or Object Authors retrieved 
 */
router.delete('/', async (req, res) => {
	const status = await deleteInbox(req.cookies.token, req.params.authorId);

	return res.sendStatus(status);
})

module.exports = router;
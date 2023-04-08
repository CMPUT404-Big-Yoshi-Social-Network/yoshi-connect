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
const { getInbox, postInboxLike, deleteInbox, postInboxPost, getNotifications, postInboxComment, postInboxRequest, sendToForeignInbox} = require('../routes/inbox')
const { deleteRequest, getRequests, getRequest } = require('../routes/request');
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
const { Login } = require('../scheme/author');
const { getAuthor } = require('../routes/author');

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
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                type:
 *                  type: string
 *                  example: inbox
 *                author:
 *                  type: string
 *                  example: https://yoshi-connect.herokuapp.com/authors/6151077f9ffb46aba8c9dab7b2ae375c
 *                items: 
 *                  type: array
 *                  items:
 *                    type: object
 *                  description: array of posts in inbox
 *                  example:
 *                    - type: post
 *                      title: testing comments
 *                      id: https://sociallydistributed.herokuapp.com/authors/bddddc62-a6d6-4f79-8a7d-4249719e1e61/posts/10d2d1e5-aac8-4058-ab83-4d9954ec103c
 *                      source: https://sociallydistributed.herokuapp.com/authors/bddddc62-a6d6-4f79-8a7d-4249719e1e61/posts/10d2d1e5-aac8-4058-ab83-4d9954ec103c
 *                      origin: https://sociallydistributed.herokuapp.com/authors/bddddc62-a6d6-4f79-8a7d-4249719e1e61/posts/10d2d1e5-aac8-4058-ab83-4d9954ec103c
 *                      description: testing comments
 *                      contentType: text/plain
 *                      content: testing comments
 *                      author:
 *                        type: author
 *                        host: https://sociallydistributed.herokuapp.com/
 *                        displayName: hari
 *                        profileImage: ""
 *                        url: https://sociallydistributed.herokuapp.com/authors/bddddc62-a6d6-4f79-8a7d-4249719e1e61
 *                        github: ""
 *                      categories: 
 *                        - hello
 *                      count: 0
 *                      likeCount: 0
 *                      comments: https://sociallydistributed.herokuapp.com/authors/bddddc62-a6d6-4f79-8a7d-4249719e1e61/posts/10d2d1e5-aac8-4058-ab83-4d9954ec103c/comments/
 *                      published: 2023-04-07T21:47:32.701Z
 *                      visibility: FRIENDS
 *                      unlisted: false
 *                    - type: post
 *                      title: This is an image post
 *                      id: https://bigger-yoshi.herokuapp.com/api/authors/b7ac83ad-9ef6-47ee-b51a-cd9f74b7c3f2/posts/a58dab7d-c051-42a7-ac40-95b31219551c
 *                      source: https://bigger-yoshi.herokuapp.com/api/authors/b7ac83ad-9ef6-47ee-b51a-cd9f74b7c3f2/posts/a58dab7d-c051-42a7-ac40-95b31219551c
 *                      origin: https://bigger-yoshi.herokuapp.com/api/authors/b7ac83ad-9ef6-47ee-b51a-cd9f74b7c3f2/posts/a58dab7d-c051-42a7-ac40-95b31219551c
 *                      description: ""
 *                      contentType: text/plain
 *                      content: Inbox Post
 *                      author:
 *                        type: object
 *                        description: author object
 *                        example: 
 *                          type: author
 *                          id: https://bigger-yoshi.herokuapp.com/api/authors/b7ac83ad-9ef6-47ee-b51a-cd9f74b7c3f2
 *                          host: https://bigger-yoshi.herokuapp.com/api/
 *                          displayName: AkshatPandey
 *                          github: https://github.com/AkshatPandey1
 *                          url: https://bigger-yoshi.herokuapp.com/api/authors/b7ac83ad-9ef6-47ee-b51a-cd9f74b7c3f2
 *                          profileImage: https://bigger-yoshi.herokuapp.com/api/authors/b7ac83ad-9ef6-47ee-b51a-cd9f74b7c3f2/posts/88f3011e-c74d-45cf-ab14-0179832dab24/image
 *                      categories: 
 *                        - ""
 *                      count: 0
 *                      likeCount: 0
 *                      comments: https://bigger-yoshi.herokuapp.com/api/authors/b7ac83ad-9ef6-47ee-b51a-cd9f74b7c3f2/posts/undefined/comments/
 *                      published: 2023-04-07T21:47:32.701Z
 *                      visibility: FRIENDS
 *                      unlisted: false
 */
router.get('/', async (req, res) => {
    const [posts, status] = await getInbox(req.cookies.token, req.params.authorId, req.query.page, req.query.size); 

    if (status != 200) { return res.sendStatus(status); }

    return res.json(posts);
})

router.get('/notifications', async (req, res) => {
    const notifications = await getNotifications(req.params.authorId); 
    let likeSummaries = []
    for (let i = 0; i < (notifications.likes.length > 5 ? 5 : notifications.likes.length); i++) {
        likeSummaries.push(notifications.likes[i].summary)
    }
    let commentSummaries = []
    for (let i = 0; i < (notifications.comments.length > 5 ? 5 : notifications.comments.length); i++) {
        commentSummaries.push(notifications.comments[i].author.displayName + ' made a comment on your post!')
    }
    return res.json({
        likes: likeSummaries,
        comments: commentSummaries
    })
})

router.get('/requests', async (req, res) => {
    if (!req.cookies || await checkExpiry(req.cookies.token)) { return res.sendStatus(401); }
  
    const authorId = req.params.authorId;
    await getRequests(authorId, res);
})

router.delete('/requests/:foreignAuthorId', async (req, res) => {
    const authorId = req.params.authorId;
    const foreignId = req.params.foreignAuthorId;
  
    await deleteRequest(res, null, null, authorId, foreignId, 'reject', true)
})

// TBA 200
/**
 * @openapi
 * components:
 *   schemas:
 *     post:
 *       properties:
 *         type:
 *           type: string
 *         title:
 *           type: string
 *         id: 
 *           type: string
 *         source:
 *           type: string
 *         origin: 
 *           type: string
 *         description: 
 *           type: string
 *         contentType: 
 *           type: string
 *         content: 
 *           type: string
 *         author:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *             id: 
 *               type: string
 *             authorId:
 *               type: string
 *             url: 
 *               type: string
 *             host: 
 *               type: string
 *             displayName: 
 *               type: string
 *             github:
 *               type: string
 *             profileImage: 
 *               type: string
 *             about:
 *               type: string
 *             pronouns:
 *               type: string
 *         categories:
 *           type: array
 *         count: 
 *           type: number
 *         likeCount: 
 *           type: number
 *         comments: 
 *           type: string
 *         published: 
 *           type: string
 *         visibility:
 *           type: string
 *         unlisted:
 *           type: string
 *     comment:
 *       properties:
 *         type:
 *           type: string
 *         comment: 
 *           type: string
 *         contentType:
 *           type: string
 *         author:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *             id: 
 *               type: string
 *             authorId:
 *               type: string
 *             url: 
 *               type: string
 *             host: 
 *               type: string
 *             displayName: 
 *               type: string
 *             github:
 *               type: string
 *             profileImage: 
 *               type: string
 *             about:
 *               type: string
 *             pronouns:
 *               type: string
 *     like:
 *       properties:
 *         type:
 *           type: string
 *         summary:
 *           type: string
 *         object:
 *           type: string
 *         author:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *             id: 
 *               type: string
 *             authorId:
 *               type: string
 *             url: 
 *               type: string
 *             host: 
 *               type: string
 *             displayName: 
 *               type: string
 *             github:
 *               type: string
 *             profileImage: 
 *               type: string
 *             about:
 *               type: string
 *             pronouns:
 *               type: string
 *     follower:
 *       properties:
 *         type:
 *            type: string
 *            description: follow
 *         actor:
 *           type: object
 *           description: author object, author who is going to be a follower
 *           properties:
 *             type:
 *               type: string
 *               description: author
 *             id: 
 *               type: string
 *             url: 
 *               type: string
 *             host: 
 *               type: string
 *             displayName: 
 *               type: string
 *             github:
 *               type: string
 *             profileImage: 
 *               type: string
 *         object:
 *           type: object
 *           description: author object, author you want to follow
 *           properties:
 *             type:
 *               type: string
 *             id: 
 *               type: string
 *             url: 
 *               type: string
 *             host: 
 *               type: string
 *             displayName: 
 *               type: string
 *             github:
 *               type: string
 *             profileImage: 
 *               type: string
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
 *    requestBody:
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            oneOf:
 *              - $ref: '#/components/schemas/post'
 *              - $ref: '#/components/schemas/comment'
 *              - $ref: '#/components/schemas/like'
 *              - $ref: '#/components/schemas/follow'
 *          examples:
 *            post:
 *              type: post
 *              title: I need to show the categories on the post somehow
 *              id: https://yoshi-connect.herokuapp.com/authors/6151077f9ffb46aba8c9dab7b2ae375c/posts/9c5adbebda5044c994f3e18cef23134c
 *              source: 
 *              origin: 
 *              description: 
 *              contentType: 
 *              content: 
 *              author:
 *                type: author
 *                id: 
 *                authorId: 
 *                host:
 *                displayName:
 *                url: 
 *                github: 
 *                profileImage: 
 *                about: 
 *                pronouns: 
 *              categories:
 *                - cat
 *              count: 
 *              likeCount: 
 *              comments: 
 *              published: 
 *              visibility: 
 *              unlisted: 
 *            comment:
 *              type: comment
 *            like:
 *              type: like
 *            follow:
 *              type: follow
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
        if( await IncomingCredentials.findOne({auth: authHeader})) {
            authorized = true;
        }
    }

    if(req.cookies.token){
        let authorId;
        const token = req.cookies.token;
        if(!token){
            return res.sendStatus(401);
        }
        if(req.body.type.toLowerCase() == "comment" || req.body.type.toLowerCase() == "post" || req.body.type.toLowerCase() == "like"){
            if (req.body.author && req.body.author.id) {
                authorId = req.body.author.id.split("/");
                authorId = authorId[authorId.length - 1];
            } 
            else if(req.body.authorId) {
                authorId = req.body.authorId
                req.body.author = getAuthor(authorId);
            }
            else if(req.body.author && req.body.author.authorId){
                authorId = req.body.author.authorId;
            }
            else if(req.cookies.token) {
                let login = await Login.findOne({token: req.cookies.token});
                if(login){
                    authorId = login.authorId;
                    req.body.author = (await getAuthor(authorId))[0];
                }
            }
        }
        else if(req.body.type.toLowerCase() == "follow"){
            authorId = req.body.actor.id.split("/");
            authorId = authorId[authorId.length - 1];
        }
        else{
            return res.sendStatus(400);
        }

        if( await authLogin(token, authorId)){
            authorized = true;
        }
    }


    //TODO fix this once and for all
    if(!authorized && (req.headers["x-requested-with"] != "XMLHttpRequest" || req.headers["X-Requested-With"] != "XMLHttpRequest")){
        res.set("WWW-Authenticate", "Basic realm=\"ServerToServer\", charset=\"ascii\"");
        return res.sendStatus(401);
    }
    else if(!authorized){
        return res.sendStatus(401);
    }

    let idURL = req.params.authorId.split("/");
    let host = process.env.DOMAIN_NAME.split("/")
    host = host[2];
    if((idURL[0] == "http:" || idURL[0] == "https:") && idURL[2] == host && idURL[3] == "authors"){
        req.params.authorId = idURL[4];
    }
    else if((idURL[0] == "http:" || idURL[0] == "https:") && idURL.find(element => element === "authors")){
        //Check if the host name is in mongo
        //If not then 401
        //Else send a post request to that server with the associated request
        let outgoings = await OutgoingCredentials.find().clone();
        for(let i = 0; i < outgoings.length; i++){
            let outgoing = outgoings[i];
            if (outgoing.allowed) {
                let url = outgoing.url.split("/");
                url = url[2];
                if(url != idURL[2]){
                    continue;
                }
    
                let [response, status] = await sendToForeignInbox(req.params.authorId, outgoing.auth, req.body);
                if(status > 200 && status < 300){
                    return res.json(response);
                }
                return res.sendStatus(status);
            }
        }
        return res.sendStatus(400);
    }

    //NEED to fix req.body.author.id to the id of the inbox haver
    if (req.body.type === undefined) {
        return res.json({
            message: "You did not specify a type.",
            invalidPost: req.body
        })
    } else {
        const type = req.body.type.toLowerCase();
        let response, status;
        if(type === "post"){
            //For other servers to send their authors posts to us
            [response, status] = await postInboxPost(req.body, req.params.authorId, res);
        }
        else if(type === "follow"){
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
            if (req.params.authorId !== undefined && req.params.authorId !== null) {
                [response, status] = await postInboxRequest(actor, req.body.object, req.params.authorId, type);
            } 
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
    
        if (status != 200) {
            return res.sendStatus(status);
        }
    
        if(type === "comment"){
            response = {
                type: "comment",
                author: response.author,
                comment: response.comment,
                contentType: response.contentType,
                published: response.published,
                id: response._id
            }
        }
    
        if (req.body.postTo === '' || req.body.postTo === null || req.body.postTo === undefined) {
            return res.json(response);
        }
    }
})

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
 *    summary: deletes inbox
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
 *      404: 
 *        description: No author was found 
 *      401: 
 *        description: Token has expired or is not authenticated 
 */
router.delete('/', async (req, res) => {
    const status = await deleteInbox(req.cookies.token, req.params.authorId);

    return res.sendStatus(status);
})

module.exports = router;
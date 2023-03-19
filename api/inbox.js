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
const { getInbox, postInboxLike, deleteInbox, postInboxPost} = require('../routes/inbox')

// Router Setup
const express = require('express'); 

// Router
const router = express.Router({mergeParams: true});

router.get('/', async (req, res) => {
	const authorId = req.params.authorId;
	const size = req.query.size;
	const page = req.query.page;
	const [posts, status] = await getInbox(authorId, size, page); 

	if(status != 200){
		return res.sendStatus(status);
	}

	return res.json(posts);
})

router.post('/', async (req, res) => {
	const type = req.body.type;
	
	if(type == "post"){
		//For other servers to send their authors posts to us
		await postInboxPost(req.body);
	}
	if(type == "follow"){
		//For local/remote authors to server 
		await postInboxFollow(req.body);
	}
	if(type == "like"){
		await postInboxLike(req.body, req.params.authorId);
	}
	if(type == "comment"){
		await postInboxComment(req.body);
	}
	return res.sendStatus(200);
})

router.delete('/', async (req, res) => {
	const status = await deleteInbox(req.cookies.token, req.params.authorId);

	return res.sendStatus(status);
})

module.exports = router;
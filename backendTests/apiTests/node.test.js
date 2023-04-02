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
const request = require("supertest");
const app = require("../../app.js");

// TODO
// Add the correct values and returns

describe("Testing if the endpoints exist for /nodes", () => {
    const basePath = "/nodes"


    describe("/incoming", () => {
        let currentPath = basePath + "/incoming"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        })

        it.only("post", async () => {
            await request(app).post(currentPath).send({})
        })
    })


    describe("/incoming/:credId", () => {
        let currentPath = basePath + "/incoming/credId"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        })

        it.only("delete", async () => {
            await request(app).delete(currentPath).send({})
        })

        it.only("put", async () => {
            await request(app).put(currentPath).send({})
        })
    })


    describe("/outgoing", () => {
        let currentPath = basePath + "/outgoing"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        })

        it.only("post", async () => {
            await request(app).post(currentPath).send({})
        })
    })


    describe("/outgoing/:credId", () => {
        let currentPath = basePath + "/outgoing/credId"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        })

        it.only("delete", async () => {
            await request(app).delete(currentPath).send({})
        })

        it.only("put", async () => {
            request(app).put(currentPath).send({})
        })  
    })


    describe("/outgoing/authors", () => {
        let currentPath = basePath + "/outgoing/authors"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        })
    })


    describe("/outgoing/authors/:authorId", () => {
        let currentPath = basePath + "/outgoing/authors/authorId"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        })
    })


    describe("/outgoing/authors/:authorId/followers", () => {
        let currentPath = basePath + "/outgoing/authors/authorId/followers"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        })
    })


    describe("/outgoing/authors/:authorId/followers/:foreignId", () => {
        let currentPath = basePath + "/outgoing/authors/authorId/followers/foreignId"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        })
    })


    describe("/outgoing/authors/:authorId/inbox/like", () => {
        let currentPath = basePath + "/outgoing/authors/authorId/inbox/like"
        it.only("post", async () => {
            await request(app).post(currentPath).send({})
        })
    })


    describe("/outgoing/authors/:authorId/inbox/:type", () => {
        let currentPath = basePath + "/outgoing/authors/authorId/inbox/type"
        it.only("post", async () => {
            await request(app).post(currentPath).send({})
        })
    })


    describe("/outgoing/authors/:authorId/liked", () => {
        let currentPath = basePath + "/outgoing/authors/authorId/liked"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        })
    })


    describe("/outgoing/authors/:authorId/posts/:postId", () => {
        let currentPath = basePath + "/outgoing/authors/authorId/posts/postId"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        })
    })


    describe("/outgoing/authors/:authorId/posts/:postId/comments", () => {
        let currentPath = basePath + "/outgoing/authors/authorId/posts/postId/comments"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        })
    })


    describe("/outgoing/authors/:authorId/posts/:postId/comments/:commentId/likes", () => {
        let currentPath = basePath + "/outgoing/authors/authorId/posts/postId/comments/commentId/likes"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        })
    })


    describe("/outgoing/authors/:authorId/posts/:postId/image", () => {
        let currentPath = basePath + "/outgoing/authors/authorId/posts/postId/image"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        })
    })


    describe("/outgoing/authors/:authorId/posts/:postId/likes", () => {
        let currentPath = basePath + "/outgoing/authors/authorId/posts/postId/likes"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        })
    })


    describe("/outgoing/posts", () => {
        let currentPath = basePath + "/outgoing/posts"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        })
    })
})
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

describe("Testing if the endpoints exist for /authorId/posts", () => {
    const basePath = "/authorId/posts"

    describe("/", () => {
        let currentPath = basePath + "/"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        })

        it.only("put", async () => {
            await request(app).put(currentPath).send({})
        }) 
    })


    describe("/:postid", () => {
        let currentPath = basePath + "/postId"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        })

        it.only("post", async () => {
            await request(app).post(currentPath).send({})
        })

        it.only("delete", async () => {
            await request(app).delete(currentPath).send({})
        })
    })


    describe("/:postid/image", () => {
        let currentPath = basePath + "/postId/image"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        })

        it.only("post", async () => {
            await request(app).post(currentPath).send({})
        })

        it.only("put", async () => {
            await request(app).put(currentPath).send({})
        }) 
    })


    describe("/:postId/likes", () => {
        let currentPath = basePath + "/postId/likes"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        })
    })


    describe("/friends-posts", () => {
        let currentPath = basePath + "/friends-posts"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        })
    })


    describe("/other/:other", () => {
        let currentPath = basePath + "/other/other"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        })
    })


    describe("/personal", () => {
        let currentPath = basePath + "/personal"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        })
    })


    describe("/public", () => {
        let currentPath = basePath + "/public"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        }) 
    })


    describe("/:postId/share", () => {
        let currentPath = basePath + "/postId/share"
        it.only("post", async () => {
            await request(app).post(currentPath).send({})
        }) 
    })
})



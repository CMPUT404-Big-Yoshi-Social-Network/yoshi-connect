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

describe("Endpoints for /, Only testing if the endpoints reach", () => {
    const basePath = "/authorId/posts"

    describe("For /", () => {
        let currentPath = basePath + "/"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        })

        it.only("post", async () => {
            await request(app).post(currentPath).send({})
        }) 
    })


    describe("For /:postid/", () => {
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

        it.only("put", async () => {
            await request(app).put(currentPath).send({})
        }) 
    })


    describe("For /:postId/likes", () => {
        let currentPath = basePath + "/postId/likes"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        })
    })


    describe("For /friends-posts", () => {
        let currentPath = basePath + "/friends-posts"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        })
    })


    describe("For /other/:other", () => {
        let currentPath = basePath + "/other/other"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        })
    })


    describe("For /personal", () => {
        let currentPath = basePath + "/personal"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        })
    })


    describe("For /public", () => {
        let currentPath = basePath + "/public"
        it.only("get", async () => {
            await request(app).get(currentPath).send({})
        }) 
    })




    


    
    

    


})




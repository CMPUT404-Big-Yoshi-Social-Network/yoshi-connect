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

const { Author, Login } = require('../../scheme/author.js');
const { Follower, Following } = require('../../scheme/relations.js');
const { PostHistory, Inbox } = require('../../scheme/post.js');

const { registerAuthor, getProfile, getAuthor, updateAuthor, getAuthors, validateAuthorObject } = require("../../routes/author.js");


describe("Testing regisiterAuthor", () => {
    it.only("no data", async () => {
        Author.findOne = jest.fn()
        .mockReturnValueOnce({ username: "not username" })
        .mockReturnValueOnce({ email: "email" });
        let req = { body: {
        }};
        let res = { sendStatus: jest.fn((inp) => inp) };
        await expect(registerAuthor(req, res)).resolves.toBe(400);
    });

    it.only("No username", async () => {
        Author.findOne = jest.fn()
        .mockReturnValueOnce({ username: "not username" })
        .mockReturnValueOnce({ email: "not email" });
        let req = { body: {
            email: "email", 
            password: "password"
        }};
        let res = { sendStatus: jest.fn((inp) => inp) };
        await expect(registerAuthor(req, res)).resolves.toBe(400);
    });

    it.only("No email", async () => {
        Author.findOne = jest.fn()
        .mockReturnValueOnce({ username: "not username" })
        .mockReturnValueOnce({ email: " not email" });
        let req = { body: {
            username: "username", 
            password: "password"
        }};
        let res = { sendStatus: jest.fn((inp) => inp) };
        await expect(registerAuthor(req, res)).resolves.toBe(400);
    });

    it.only("No password", async () => {
        Author.findOne = jest.fn()
        .mockReturnValueOnce({ username: "not username" })
        .mockReturnValueOnce({ email: " not email" });
        let req = { body: {
            username: "username", 
            email: "email", 
        }};
        let res = { sendStatus: jest.fn((inp) => inp) };
        await expect(registerAuthor(req, res)).resolves.toBe(400);
    });

    it.only("Username is in use", async () => {
        Author.findOne = jest.fn().mockReturnValueOnce({ username: "username" });
        let req = { body: {
            username: "username", 
            email: "email", 
            password: "password"
        }};
        let res = { sendStatus: jest.fn((inp) => inp) };
        await expect(registerAuthor(req, res)).resolves.toBe(400);
    });
})
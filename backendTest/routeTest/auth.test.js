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

const crypto_js = require('crypto-js')
const { Author, Login } = require('../../scheme/author.js');
const {checkUsername, removeLogin, checkExpiry, checkAdmin, authAuthor, authLogin} = require("../../routes/auth.js");

describe("Testing checkUsername", () => {
    it.only("Username already exist", async () => {
        Author.findOne = jest.fn().mockReturnValueOnce({ username: "username" });
        await expect(checkUsername({body: {username: "username"}})).resolves.toBe("In use");
    });

    it.only("Username doesn't exist", async () => {
        Author.findOne = jest.fn().mockReturnValueOnce({ username: "Username"});
        await expect(checkUsername({body: {username: "username"}})).resolves.toBe("Not in use");
    });

    it.only("DB returns undefined object", async () => {
        Author.findOne = jest.fn().mockReturnValueOnce({ undefined });
        await expect(checkUsername({body: {username: "username"}})).resolves.toBe("Not in use");
    });
});


describe("Testing removeLogin", () => {
    it.only("Token is undefined", async () => {
        await expect(removeLogin({cookies: {token: undefined}}, {sendStatus: jest.fn((inp) => inp)}
        )).resolves.toBe(401);
    });
});


describe("Testing checkExpiry", () => {
    // findOne().clone breaks the test, not sure how to get by this 
    it.only("Token is undefined", async () => {
        await expect(checkExpiry(undefined)).resolves.toBe(true);
    });
    // it.only("Token is not expired", async () => {
    //     Login.findOne().clone = jest.fn().mockReturnValueOnce({expires: new Date("2025-03-25")});
    //     Login.findOne = jest.fn().mockReturnValueOnce({expires: new Date("2025-03-25")});
    //     await expect(checkExpiry("token")).resolves.toBe(false);
    // });
    // it.only("Token is expired", async() => {
    //     Login.findOne = jest.fn().mockReturnValueOnce({expires: new Date("2020-03-25")});
    //     await expect(checkExpiry("token")).resolves.toBe(true);
    // });
    // it.only("DB returns null", async () => {
    //     Login.findOne = jest.fn().mockReturnValueOnce(null);
    //     await expect(checkExpiry("")).resolves.toBe(true);
    // }); 
});


describe("Testing checkAdmin", () => {
    it.only("Token is undefined", async () => {
        await expect(checkAdmin({cookies: {token: undefined}})).resolves.toBe(false);
    })

    it.only("account is an admim", async () => {
        Login.findOne = jest.fn().mockReturnValueOnce({admin: true});
        await expect(checkAdmin({cookies: {token: "token"}})).resolves.toBe(true);
    });

    it.only("account is not an admim", async () => {
        Login.findOne = jest.fn().mockReturnValueOnce({admin: false});
        await expect(checkAdmin({cookies: {token: "token"}})).resolves.toBe(false);
    });

    it.only("DB returns null", async () => {
        Login.findOne = jest.fn().mockReturnValueOnce(null);
        await expect(checkAdmin({cookies: {token: "token"}})).resolves.toBe(false);
    });
});


describe("Testing authAuthor", () => {
    it.only("Nothing given", async () => {
        await expect(authAuthor({
            body: {}}, 
            { sendStatus: jest.fn((inp) => inp) }))
        .resolves.toBe(400);
    });

    it.only("No username given", async () => {
        await expect(authAuthor({ 
            body: {passsword: "password"}}, 
            { sendStatus: jest.fn((inp) => inp) }))
        .resolves.toBe(400);
    });

    it.only("No password given", async () => {
        await expect(authAuthor({
            body: {username: "username"}}, 
            { sendStatus: jest.fn((inp) => inp) }))
        .resolves.toBe(400);
    });

    it.only("Username does not exist", async () => {
        Author.findOne = jest.fn().mockReturnValueOnce(null)
        await expect(authAuthor({
            body: {username: "username", password: "password"}}, 
            { sendStatus: jest.fn((inp) => inp) }))
        .resolves.toBe(404);
    });

    it.only("User has not been enabled", async () => {
        Author.findOne = jest.fn().mockReturnValueOnce({})
        await expect(authAuthor(
            {
                body: {username: "username", password: "password"}, 
                author: {allowed: false}}, 
            { sendStatus: jest.fn((inp) => inp) }))
        .resolves.toBe(401);
    });


    it.only("Password is incorrect", async () => {
        crypto_js.SHA256 = jest.fn((pass) => pass)
        Author.findOne = jest.fn().mockReturnValueOnce({allowed: true, password: "password"})
        await expect(authAuthor(
            {
                body: {username: "username", password: "wrong password"}, 
                author: {}}, 
            { sendStatus: jest.fn((inp) => inp)} ))
        .resolves.toBe(500);
    });

    it.only("User is not an admin", async () => {
        crypto_js.SHA256 = jest.fn((pass) => pass)
        Author.findOne = jest.fn().mockReturnValueOnce({
            allowed: true, 
            password: "password",
            admin: false

        });
        await expect(authAuthor(
            {
                body: {username: "username", password: "password"}, 
                cookies: {token: null},
                baseUrl: "/admin", 
                author: {}
            }, 
            { sendStatus: jest.fn((inp) => inp) }))
        .resolves.toBe(403);
    });
});


describe("Testing authLogin" , () => {
    it.only("Token is expired", async () => {
        await expect(authLogin(undefined, "authorId")).resolves.toBe(false);
    });
    // can't do the rest as I don't know how to handle the .clone()
    // it.only("DB returns null", async () => {
    //     Login.findOne = jest.fn().mockReturnValueOnce(null)
    //     await expect(authLogin("token", "authorId")).resolves.toBe(false);
    // });

    // it.only("Wrong authorId", async () => {
    //     Login.findOne = jest.fn().mockReturnValueOnce({authorId: "authorId"});
    //     await expect(authLogin("token", "wrong authorId")).resolves.toBe(false);
    // });

    // it.only("Correct info", async () => {
    //     Login.findOne = jest.fn().mockReturnValueOnce({authorId: "authorId"});
    //     await expect(authLogin("token", "authorId")).resolves.toBe(true);
    // });
});
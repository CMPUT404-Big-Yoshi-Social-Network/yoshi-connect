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

const { Login } = require('../scheme/author.js');
const { checkExpiry } = require('./auth.js');
const { getAuthor } = require('./author.js')

async function getUserInfo(token){
    /**
    Description: Gets the Author's user information 
    Associated Endpoint: /userinfo
    Request Type: GET
    Request Body: { token: 5yy7bCMPrSXSv9knpS4gfz }
    Return: 401 Status (Unauthorized) -- Author token is not authenticated
            404 Status (Not Found) -- Author was not found in database
            500 Status (Internal Server Error) -- Unable to retreive author from database
            200 Status (OK) -- Returns Author's authorId  
    */
    if (await checkExpiry(token)) { return [{}, 401]; }
    
    const login = await Login.findOne({token: token}); 

    return await getAuthor(login.authorId);
}

module.exports = {
    getUserInfo,
}
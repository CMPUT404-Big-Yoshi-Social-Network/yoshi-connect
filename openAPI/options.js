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

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Yoshi Connect - API',
            description: 'This is the documentation for Yoshi Connect API endpoints',
            license: {
                'name': 'Apache 2.0',
                'identifier': "Apache-2.0"
            }
        }
    },
    apis: [
        './server.js',
        './openAPI/components.js',
        './api/admin.js',
        './api/author.js',
        './api/comment.js',
        './api/follower.js',
        './api/following.js',
        './api/friend.js',
        './api/inbox.js',
        './api/login.js',
        './api/post.js',
        './api/profile.js',
        './api/request.js',
        './api/settings.js',
        './api/signup.js',
        './api/userinfo.js',
    ],
};

module.exports={
    options
}
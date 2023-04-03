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

// Functionality 
import React from 'react';


/*
Example of activity
 {
    "id": "28150601058",
    "type": "PushEvent",
    "actor": {
      "id": 47871461,
      "login": "Holy-Hero",
      "display_login": "Holy-Hero",
      "gravatar_id": "",
      "url": "https://api.github.com/users/Holy-Hero",
      "avatar_url": "https://avatars.githubusercontent.com/u/47871461?"
    },
    "repo": {
      "id": 586055695,
      "name": "CMPUT404-Big-Yoshi-Social-Network/yoshi-connect",
      "url": "https://api.github.com/repos/CMPUT404-Big-Yoshi-Social-Network/yoshi-connect"
    },
    "payload": {
      "repository_id": 586055695,
      "push_id": 13163434259,
      "size": 2,
      "distinct_size": 2,
      "ref": "refs/heads/development",
      "head": "5d0caa3a3d60eb74b33bcabd2bf86801d3bbc735",
      "before": "c53de0bfde6a8ea9b88f3afa5b009125e1515bcf",
      "commits": [
        {
          "sha": "b296115a96515f8992d8cbdaa03ef4bb9417b501",
          "author": {
            "email": "88dark.allan@gmail.com",
            "name": "Allan"
          },
          "message": "Fixed status issue for updating profile",
          "distinct": true,
          "url": "https://api.github.com/repos/CMPUT404-Big-Yoshi-Social-Network/yoshi-connect/commits/b296115a96515f8992d8cbdaa03ef4bb9417b501"
        },
        {
          "sha": "5d0caa3a3d60eb74b33bcabd2bf86801d3bbc735",
          "author": {
            "email": "88dark.allan@gmail.com",
            "name": "Allan"
          },
          "message": "Merge branch 'development' of https://github.com/CMPUT404-Big-Yoshi-Social-Network/yoshi-connect into development",
          "distinct": true,
          "url": "https://api.github.com/repos/CMPUT404-Big-Yoshi-Social-Network/yoshi-connect/commits/5d0caa3a3d60eb74b33bcabd2bf86801d3bbc735"
        }
      ]
    },
    "public": true,
    "created_at": "2023-04-03T00:27:04Z",
    "org": {
      "id": 122124281,
      "login": "CMPUT404-Big-Yoshi-Social-Network",
      "gravatar_id": "",
      "url": "https://api.github.com/orgs/CMPUT404-Big-Yoshi-Social-Network",
      "avatar_url": "https://avatars.githubusercontent.com/u/122124281?"
    }
  }
  */


function Activity({activity}) {


    return (
        <div style={{padding: "1em"}}>
            <span>{activity.user.name} </span>
            <span>{activity.text} </span>
            <br/>
        </div>
    )
}

export default Activity
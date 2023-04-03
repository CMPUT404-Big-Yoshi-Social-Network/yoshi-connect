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

// Styling
import './github.css';


/*
Example of activity
 {
    "id": "28050509152",
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
      "push_id": 13110868152,
      "size": 1,
      "distinct_size": 1,
      "ref": "refs/heads/profile-pic",
      "head": "75f09894a20a12b68eaff929088dfaa8fb6363c1",
      "before": "97220f57b164ce7d48f6462920aa87fe326d0d6e",
      "commits": [
        {
          "sha": "75f09894a20a12b68eaff929088dfaa8fb6363c1",
          "author": {
            "email": "88dark.allan@gmail.com",
            "name": "Allan"
          },
          "message": "Added profile pic",
          "distinct": true,
          "url": "https://api.github.com/repos/CMPUT404-Big-Yoshi-Social-Network/yoshi-connect/commits/75f09894a20a12b68eaff929088dfaa8fb6363c1"
        }
      ]
    },
    "public": true,
    "created_at": "2023-03-29T05:08:52Z",
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
        <div className='github-feed'>
            <p className='github-p'> 
                <span>{activity.actor.login} </span>
                <span>{activity.type.split("Event")[0].toLowerCase()} </span>
                <span>{activity.type.split("Event")[0] === "Create" ? "branch " + activity.payload.ref : "to branch " + activity.payload.ref.split("/")[2]} </span>
                <span>{activity.type.split("Event")[0] === "Create" ? "for" : "from"} {activity.repo.name} </span>
                <span>at {activity.created_at.split("T")[1].slice(0, 8)} on {activity.created_at.split("T")[0]} </span>
            </p>
            {/* <hr className='github-hr'/> */}
        </div>
    )
}

export default Activity
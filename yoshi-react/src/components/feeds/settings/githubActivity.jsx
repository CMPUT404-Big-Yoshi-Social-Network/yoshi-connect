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
            "text": "Created sharing-local branch on CMPUT404-Big-Yoshi-Social-Network/yoshi-connect",
            "user": {
              "name": "Holy-Hero",
              "link": "https://github.com/Holy-Hero",
              "img": "https://avatars.githubusercontent.com/u/47871461?"
            },
            "repo": {
              "name": "CMPUT404-Big-Yoshi-Social-Network/yoshi-connect",
              "link": "https://github.com/CMPUT404-Big-Yoshi-Social-Network/yoshi-connect"
            },
            "created": {
              "type": "branch",
              "branch": "sharing-local"
            },
            "type": "create"
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
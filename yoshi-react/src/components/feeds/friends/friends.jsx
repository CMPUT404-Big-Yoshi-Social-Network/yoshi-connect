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
import axios from 'axios';
import React, { useEffect, useState } from "react";

// Child Component 
import Friend from './friend.jsx';

function Friends() {
    /**
     * Description: Represents the friends list of the current author 
     * Functions: 
     *     - useEffect(): Fetches the author's friends  
     * Returns: N/A
     */
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        /**
         * Description: Fetches all the Author objects that are friends with the current author 
         * Request: POST
         * Returns: N/A 
         */
        console.log('Debug: Fetching all the friends for this author')
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/server/friends',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: { sessionId: localStorage.getItem('sessionId'), }
        }
        axios
        .post('/server/friends', config)
        .then((response) => { setFriends(response.data.friends) })
        .catch(err => { console.error(err); });
    }, [setFriends]);
    
    return (
        <div style={{fontFamily: 'Signika', paddingLeft:'1em'}}>
            <h3>Friends</h3>
            { (friends === undefined) ? null :
                <div>
                    {Object.keys(friends).map((friend, idx) => (
                        <Friend key={idx} {...friends[friend]}/>
                    ))}
                </div>
            }
        </div>
    )
}

export default Friends;
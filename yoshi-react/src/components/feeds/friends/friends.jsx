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

function Friends(props) {
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        if (props.authorId) {
            axios
            .get('/authors/' + props.authorId + '/friends')
            .then((response) => { 
                setFriends(response.data.items) 
            })
            .catch(err => { 
                if (err.response.status === 404) { setFriends([]); }
             });
        }
    }, [props]);

    return (
        <div style={{fontFamily: 'Signika', paddingLeft:'1em'}}>
            <h3>Friends</h3>
            { friends === undefined || friends.length === 0 ? null :
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
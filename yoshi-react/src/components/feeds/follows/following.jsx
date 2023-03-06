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

import axios from 'axios';
import React, { useEffect, useState } from "react";
import Follow from './follow.jsx';

function Following() {
    const [followings, setFollowings] = useState([]);

    useEffect(() => {
       console.log('Debug: Fetching all followings for this user')
       let config = {
           method: 'post',
           maxBodyLength: Infinity,
           url: '/server/following',
           headers: {
               'Content-Type': 'application/x-www-form-urlencoded'
           },
           data: {
               sessionId: localStorage.getItem('sessionId'),
           }
       }
       axios
       .post('/server/following', config)
       .then((response) => {
            setFollowings(response.data.following)
       })
       .catch(err => {
           console.error(err);
       });
    }, []);
    return (
        <div className='following-column' style={{fontFamily: 'Signika', paddingLeft:'1em'}}>
            <h3>Following</h3>
            {(followings === undefined) ? null :
                <div>
                    {Object.keys(followings).map((following, idx) => (
                        <Follow className='following' key={idx} {...followings[following]}/>
                    ))}
                </div>
            }
        </div>
    )
}

export default Following;
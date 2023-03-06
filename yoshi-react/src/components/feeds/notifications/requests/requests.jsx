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
import Request from './request.jsx';

function Requests() {
    const [requests, setRequests] = useState([]);
    useEffect(() => {
        console.log('Debug: Fetching all the requests for this user')
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/server/requests',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                status: 'Fetching Requests'
            }
        }
        axios
        .post('/server/requests', config)
        .then((response) => {
            setRequests(response.data.requests)
        })
        .catch(err => {
            console.error(err);
        });
    }, [setRequests]);
    return (
        <div>
            <h4>Friend Requests</h4>
            {Object.keys(requests).map((request, idx) => (
                <Request key={idx} {...requests[request]}/>
            ))}
        </div>
    )
}

export default Requests;
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

import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import React, { useEffect } from "react";
function PublicFeed() {
    const navigate = useNavigate();
    const checkExpiry = () => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: '/feed',
        }
        axios
        .get('/server/feed', config)
        .then((response) => {
            if (response.data.status === "Expired") {
                console.log("Debug: Your token is expired.")
                LogOut();
                navigate('/');
            }
            else{console.log('Debug: Your token is not expired.')}
        })
        .catch(err => {
            if (err.response.status === 401) {
                console.log("Debug: Not authorized.");
                navigate('/unauthorized'); // 401 Not Found
            }
        });
    }
    useEffect(() => {
       checkExpiry();
    });
    const LogOut = () => {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/server/feed',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                message: 'Logging Out'
            }
        }
        axios
        .post('/server/feed', config)
        .then((response) => {
            navigate("/");
        })
        .catch(err => {
          console.error(err);
        });

    }
    return (
        <div>
            Welcome to the Public Feed. You are signed in.
            <button type="button" onClick={() => LogOut()}>Log Out</button>
        </div>
    )
}

export default PublicFeed;
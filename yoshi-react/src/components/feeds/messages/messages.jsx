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
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import React, { useEffect } from "react";

// User Interface 
import TopNav from '../navs/top/nav.jsx';
import LeftNavBar from '../navs/left/nav.jsx';
import RightNavBar from '../navs/right/nav.jsx';

function Messages() {
    /**
     * Description: Represents the Messages page that authors will keep their private posts with specific authors 
     * Functions: 
     *     - checkExpiry(): Checks if the current token is expired
     *     - useEffect(): Checks if the current token is expired before render, so that the author can be logged out if needed 
     *     - logOut(): Logs out an author and sends them to the Welcome component 
     * Returns: N/A
     */
    const navigate = useNavigate();

    useEffect(() => {
        /**
         * Description: Calls checkExpiry() to check if the token is expired before render 
         * Returns: N/A
         */
        checkExpiry();
     });

    const checkExpiry = () => {
        /**
         * Description: Sends a GET request in order to check if the current author's token is expired 
         * Request: GET
         * Returns: N/A
         */
        let config = { method: 'get', maxBodyLength: Infinity, url: '/feed' }

        axios
        .get('/server/feed', config)
        .then((response) => {
            if (response.data.status === "Expired") {
                console.log("Debug: Your token is expired.")
                logOut();
                navigate('/');
            }
            else{console.log('Debug: Your token is not expired.')}
        })
        .catch(err => {
            if (err.response.status === 401) { console.log("Debug: Not authorized."); navigate('/unauthorized'); }
        });
    }

    const logOut = () => {
        /**
         * Description: Sends a POST request in order to log out the current author and redirect them to the Welcome component 
         * Request: POST
         * Returns: N/A
         */
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/server/feed',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: { message: 'Logging Out' }
        }

        axios
        .post('/server/feed', config)
        .then((response) => {
            localStorage['sessionId'] = "";
            navigate("/");
        })
        .catch(err => { console.error(err) });
    }

    return (
        <div>
            <TopNav/>
            <div className='pubRow'>
                <div className='pubColL'>
                    <LeftNavBar/>
                </div>
                <div className='pubColM'>
                    <div style={{paddingLeft: '1em'}}>
                        Viewing your messages with X user.
                    </div>
                </div>
                <div className='pubColR'>
                    <RightNavBar/>
                </div>
            </div>
        </div>
    )
}

export default Messages;
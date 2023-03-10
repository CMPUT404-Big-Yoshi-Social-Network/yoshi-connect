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
import React from "react";
import axios from 'axios';
import { useEffect, useState } from "react";

function Request(props) {
    /**
     * Description: Represents the request
     * Functions:
     *     - useEffect(): Before render, checks the author ID and sends the username
     *     - addRequest(): Adds the authour if the request is accpeted
     *     - rejectRequest(): Deletes a request if it is rejected by the author 
     * Returns: N/A
     */
    const { senderId } = props;
    const [username, setUsername] = useState({
        username: ''
    })
    useEffect(() => {
        /**
         * Description: Before render, checks the author ID and sends the username
         * Request: POST
         * Returns: N/A
         */
        let config = {
             method: 'post',
             maxBodyLength: Infinity,
             url: '/server/requests/',
             headers: {
                 'Content-Type': 'application/json'
             },
             data: {
                 sessionId: localStorage.getItem('sessionId'),
                 status: 'Fetching current authorId'
             }
         }
         axios
         .post('/server/requests/', config)
         .then((response) => {
             let username = response.data.username;
             setUsername(prevUsername => ({...prevUsername, username}))
         })
         .catch(err => { });
     }, []);
    const addRequest = () => {
        /**
         * Description: Adds the authour if the request is accpeted
         * Request: PUT
         * Returns: N/A
         */
        console.log('Debug: Adding Author')
        let config = {
            method: 'put',
            maxBodyLength: Infinity,
            url: '/server/requests',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                sender: senderId,
                receiver: username.username,
                status: 'Sender is added by Receiver'
            }
        }
        axios
        .put('/server/requests', config)
        .then((response) => {
        })
        .catch(err => {
            console.error(err);
        });
    }
    const rejectRequest = () => {
        /**
         * Description: Deletes a request if it is rejected by the author 
         * Request: DELETE
         * Returns: N/A
         */
        console.log('Debug: Rejecting Author')
        let config = {
            method: 'delete',
            maxBodyLength: Infinity,
            url: '/server/requests',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                sender: senderId,
                receiver: username,
                status: 'Sender is rejected by Receiver'
            }
        }
        axios
        .delete('/server/requests', config)
        .then((response) => {
        })
        .catch(err => {
            console.error(err);
        });
    }
    return (
        <div id='request'>
            { senderId }
            <button type="button" id='accept' onClick={() => addRequest()}>Add</button>
            <button type="button" id='reject' onClick={() => rejectRequest()}>Reject</button>
        </div>
    )
}

export default Request;
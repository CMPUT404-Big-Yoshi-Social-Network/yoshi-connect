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
import { useNavigate } from 'react-router-dom';

function Request(props) {
    /**
     * Description: Represents the request
     * Functions:
     *     - useEffect(): Before render, checks the author ID and sends the username
     *     - addRequest(): Adds the authour if the request is accpeted
     *     - rejectRequest(): Deletes a request if it is rejected by the author 
     * Returns: N/A
     */
    const navigate = useNavigate();

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
            url: '/authors/' + props.actorId + '/followers/' + props.objectId,
            headers: {
                'Content-Type': 'application/json'
            }
        }
        axios
        .put('/authors/' + props.actorId + '/followers/' + props.objectId, config)
        .then((response) => { })
        .catch(err => {
            if (err.response.status === 401) {
                navigate('/unauthorized');
            } else if (err.response.status === 400) {
                navigate('/badrequest');
            } else if (err.response.status === 500) {
                navigate('500 PAGE');
            }
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
            url: '/authors/' + props.actor + '/requests/' + props.object,
            headers: {
                'Content-Type': 'application/json'
            }
        }
        axios
        .delete('/server/requests', config)
        .then((response) => { })
        .catch(err => {
            if (err.response.status === 401) {
                navigate('/unauthorized');
            } else if (err.response.status === 400) {
                navigate('/badrequest');
            } else if (err.response.status === 500) {
                navigate('500 PAGE');
            }
        });
    }
    return (
        <div id='request'>
            { props.actor }
            <button type="button" id='accept' onClick={() => addRequest()}>Add</button>
            <button type="button" id='reject' onClick={() => rejectRequest()}>Reject</button>
        </div>
    )
}

export default Request;
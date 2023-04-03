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
import './request.css'

function Request(props) {
    /**
     * Description: Represents a Request
     * Functions: 
     *     - addRequest(): Creates a request
     *     - rejectRequest(): Deletes a request from the Author's inbox
     * Returns: N/A
     */
    console.log('Debug: <TLDR what the function is doing>')
    const navigate = useNavigate();

    const addRequest = () => {
        /**
         * Description: Creates a request through a PUT request
         * Request: PUT   
         * Returns: N/A
         */
        console.log('Debug: Creating request')
        let aId = props.actor.id
        aId = aId.split("/");
        aId = aId[aId.length - 1];
        let oId = props.object.id
        oId = oId.split("/");
        oId = oId[oId.length - 1];
        let config = {
            method: 'put',
            maxBodyLength: Infinity,
            url: '/authors/' + aId + '/followers/' + oId,
            headers: {
                'Content-Type': 'application/json'
            }
        }
        axios
        .put('/authors/' + aId + '/followers/' + oId, config)
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
         * Description: Deletes a request from the Author's inbox through a DELETE request  
         * Request: DELETE    
         * Returns: N/A
         */
        let aId = props.actor.id
        aId = aId.split("/");
        aId = aId[aId.length - 1];
        let oId = props.object.id
        oId = oId.split("/");
        oId = oId[oId.length - 1];

        axios
        .delete('/authors/' + aId + '/inbox/requests/' + oId)
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
            { props.goal !== 'accept' && props.goal !== 'reject' ? 
                <div>
                    <p className="req-name">{ props.actor.displayName }</p>
                    <button className="request-button" type="button" id='accept' onClick={() => addRequest()}>Add</button>
                    <button className="request-button" type="button" id='reject' onClick={() => rejectRequest()}>Reject</button>
                </div> :
                props.goal === 'accept' ? 
                    <div>{ props.object.displayName } accepted your request!</div> :
                    null
            }
        </div>
    )
}

export default Request;
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

import React from "react";
import { useParams } from 'react-router-dom';
import axios from 'axios';

function Request(props) {
    const { senderId } = props;
    const { username } = useParams();
    const url = '/server/requests';
    const addRequest = () => {
        console.log('Debug: Adding Author')
        let config = {
            method: 'put',
            maxBodyLength: Infinity,
            url: url,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                sender: senderId,
                receiver: username,
                status: 'Sender is added by Receiver'
            }
        }
        axios
        .put(url, config)
        .then((response) => {
        })
        .catch(err => {
            console.error(err);
        });
    }
    const rejectRequest = () => {
        console.log('Debug: Rejecting Author.')
        let config = {
            method: 'delete',
            maxBodyLength: Infinity,
            url: url,
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
        .delete(url, config)
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
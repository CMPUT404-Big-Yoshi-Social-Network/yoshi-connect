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
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ModifyNode({node, url}) {
    const navigate = useNavigate();
    const [data, setData] = useState({
        newUsername: node.displayName,
        newPassword: node.password,
        newHost: node.host
    })

    const modify = (e) => {
        /**
         * Description: Updates the author in the database
         * Request: PUT
         * Returns: N/A
         */
        e.preventDefault();

        let body = {
            newUsername: data.newUsername,
            newPassword: data.newPassword,
            newHost: data.newHost
        }

        axios
        .put(url + node.id, body)
        .then((response) => { })
        .catch(err => {
            if (err.response.status === 400) {
                navigate('/badrequest');
            } else if (err.response.status === 404) {
                navigate('/notfound');
            } else if (err.response.status === 500) {
                console.log('NEED A 500 STATUS PAGE')
            }
        });
    }

    return (
        <div id='modify'>
            <form>
                <label>
                    Username:
                    <input type="username" name="username" value={data.newUsername} onChange={(e) => {
                        setData({
                        ...data,
                        newUsername: e.target.value
                        })
                    }}/>
                </label>
                <br></br>
                <label>
                    Password:
                    <input type="text" name="password" onChange={(e) => {
                        setData({
                        ...data,
                        newPassword: e.target.value
                        })
                    }}/>
                </label>
                <br></br>
                <label>
                    About:
                    <input type="host" name="host" value={data.newHost} onChange={(e) => {
                        setData({
                        ...data,
                        newHost: e.target.value
                        })
                    }}/>
                </label>
                <br></br>
                <button type="submit" onClick={modify}>Update Node</button>
            </form>
        </div>
    )
}

export default ModifyNode;
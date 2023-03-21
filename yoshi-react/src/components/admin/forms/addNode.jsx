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
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AddNode() {
    const url = '/admin/dashboard';
    const [data, setData] = useState({ username: '', password: '', host: '' })
    const navigate = useNavigate();

    const addNode = async (e) => {
        e.preventDefault();
        let body = {
            status: 'Add',
            username: data.username,
            password: data.password,
            host: data.host
        }
        axios
        .post('/node/outgoing', body)
        .then((response) => {})
        .catch(err => {
            if (err.response.status === 400) {
                navigate('/badrequest'); 
            } else if (err.response.status === 500) {
                console.log('NEED 500 PAGE!') 
            } 
        });
    }
    
    return (
        <div id='add'>
            <form method='POST'>
                <label>
                    Username:
                    <input type="username" name="username" onChange={(e) => {
                        setData({
                        ...data,
                        username: e.target.value
                        })
                    }}/>
                </label>
                <label>
                    Password:
                    <input type="password" name="password" onChange={(e) => {
                        setData({
                        ...data,
                        password: e.target.value
                        })
                    }}/>
                </label>
                <label>
                    Host:
                    <input type="text" name="host" onChange={(e) => {
                        setData({
                        ...data,
                        host: e.target.value
                        })
                    }}/>
                </label>
                <button type="submit" onClick={addNode}>Create Node</button>
            </form>
        </div>
    )
}

export default AddNode;
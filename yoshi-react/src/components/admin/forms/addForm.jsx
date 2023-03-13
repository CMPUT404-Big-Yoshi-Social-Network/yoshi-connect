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

function AddAuthor() {
    const url = '/api/admin/dashboard';
    const [data, setData] = useState({ username: '', password: '', email: '' })
    const navigate = useNavigate();

    const addAuthor = async (e) => {
        /**
         * Description: Adds the new author to the database
         * Request: PUT
         * Returns: N/A
         */
        e.preventDefault();
        console.log('Debug: Attempting to add an author.');
        let config = {
            method: 'put',
            maxBodyLength: Infinity,
            url: url,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: {
                status: 'Add',
                username: data.username,
                password: data.password,
                email: data.email,
                admin: false
            } 
        }

        axios
        .put(url, config)
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
            <form method='PUT'>
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
                    Email:
                    <input type="email" name="email" onChange={(e) => {
                        setData({
                        ...data,
                        email: e.target.value
                        })
                    }}/>
                </label>
                <button type="submit" onClick={addAuthor}>Create Author</button>
            </form>
        </div>
    )
}

export default AddAuthor;
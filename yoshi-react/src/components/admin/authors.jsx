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
import Author from './author.jsx';

function Authors() {
    /**
     * Description: Represents all authors 
     * Functions:
     *     - useEffect(): Before render, checks and sends the authors
     * Returns: N/A
     */
    const [authors, setAuthors] = useState([]);
    const url = '/server/admin/dashboard';
    useEffect(() => {
        /**
         * Description: Before render, checks and sends the authors
         * Request: POST
         * Returns: N/A
         */
        console.log('Debug: Fetching all the authors.')
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: url,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                status: 'Fetching Authors'
            }
        }
        axios
        .post(url, config)
        .then((response) => {
            setAuthors(response.data.authors)
        })
        .catch(err => {
            console.error(err);
        });
    }, [setAuthors, url]);
    return (
        <div>
            <h3>Authors</h3>
            {Object.keys(authors).map((author, idx) => (
                <Author key={idx} {...authors[author]}/>
            ))}
        </div>
    )
}

export default Authors;
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
import { useNavigate } from 'react-router-dom';

// Child Component
import Author from './author/author.jsx';

function Authors() {
    const [authors, setAuthors] = useState([]);
    const url = '/api/authors';
    const navigate = useNavigate();

    useEffect(() => {
        console.log('Debug: Fetching all the authors.')
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: url,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }

        axios
        .post(url, config)
        .then((response) => { setAuthors(response.data.items) })
        .catch(err => {
            if (err.response.status === 404) {
                navigate('/notfound');
            } else if (err.response.status === 401) {
                navigate('/unauthorized');
            } else if (err.response.status === 500) {
                navigate('/NEED 500 PAGE')
            }
        });
    }, [setAuthors, url, navigate]);

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
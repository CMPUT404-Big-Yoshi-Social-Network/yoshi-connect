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
import React, { useEffect, useState } from 'react';

// User Interface
import './nav.css'
import SearchCard from './search.jsx';
import axios from 'axios';

function SearchOutcomes({url}) {
    /**
     * Description: Represents the list of searches
     * Functions: 
     *     - useEffect(): Fetches the form of the search 
     * Returns: N/A
     */
    const [findings, setFindings] = useState(false);
    const [authors, setAuthors] = useState([]);

    useEffect(() => {
        /**
         * Description: Fetches the form of the search  
         * Request: GET    
         * Returns: N/A
         */
        setFindings(true);

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: url,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }

        axios
        .get(url, config)
        .then((response) => { 
            if (response.data.items.length !== 0 && authors.length === 0) {
                let authors = []
                for (let i = 0; i < response.data.items.length; i++) {
                    authors.push(response.data.items[i]);
                }
                setAuthors(authors);
            }
        })
        .catch(err => {
            if (err.response.status === 404) {
                setAuthors([]);
            } else if (err.response.status === 401) {
                console.log('401')
            } else if (err.response.status === 500) {
                console.log('500')
            }
        });
    }, [setFindings, authors, url])
    console.log(authors)
    return (
        <div className='search-card'>
            { findings ? 
                <div>
                    {Object.keys(authors).map((author, idx) => (
                        <SearchCard key={idx} {...authors[author]}/>
                    ))}
                </div> :
                <p>No users found.</p>
            }   
        </div>     
    )
}

export default SearchOutcomes;


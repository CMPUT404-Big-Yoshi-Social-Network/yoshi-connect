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
import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// User Interface 
import TopNav from '../navs/top/nav.jsx';
import LeftNavBar from '../navs/left/nav.jsx';
import RightNavBar from '../navs/right/nav.jsx';

function Messages() {
    /**
     * Description: Represents the Messages page that authors will keep their private posts with specific authors 
     * Functions: 
     *     - checkExpiry(): Checks if the current token is expired
     *     - useEffect(): Checks if the current token is expired before render, so that the author can be logged out if needed 
     *     - logOut(): Logs out an author and sends them to the Welcome component 
     * Returns: N/A
     */
    const [viewer, setViewer] = useState({ viewerId: '' });
    const navigate = useNavigate();

    useEffect(() => {
        /**
         * Description: Before render, checks the author's account details
         * Request: POST
         * Returns: N/A
         */
        const getAuthor = () => {
            axios
            .get('/userinfo')
            .then((response) => {
                let viewerId = response.data.authorId;
                setViewer({ viewerId: viewerId })
            })
            .catch(err => { 
                if (err.response.status === 404) { 
                    setViewer({ viewerId: '' })
                } else if (err.response.status === 401) {
                    navigate('/unauthorized')
                }
            });
        }
        getAuthor();
    }, [navigate])

    return (
        <div>
            <TopNav/>
            <div className='pubRow'>
                <div className='pubColL'>
                    <LeftNavBar authorId={viewer.viewerId}/>
                </div>
                <div className='pubColM'>
                    <div style={{paddingLeft: '1em'}}>
                        IN CONSTRUCTION
                    </div>
                </div>
                <div className='pubColR'>
                    <RightNavBar/>
                </div>
            </div>
        </div>
    )
}

export default Messages;
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

// User Interface
import TopNav from '../navs/top/nav.jsx';
import LeftNavBar from '../navs/left/nav.jsx';
import RightNavBar from '../navs/right/nav.jsx';

// Styling 
import './public.css';

// Child Component 
import Posts from '../../posts/posts.jsx';

// Styling
import './public.css';

function PublicFeed() {
    /**
     * Description: Represents the Public Feed that displays the public (PSA) and followings (of the current author) posts  
     * Functions: 
     *     - logOut(): Logs out an author if needed and redirects to the Welcome component 
     *     - checkExpiry(): Checks if the current author's token has expired 
     *     - getId(): Gets the authorId for the current author 
     *     - getPosts(): Gets the posts of the author's following list and public (PSA) posts 
     *     - useEffect():
     *          - Calls checkExpiry() to check if the author's token is expired (if so, they will be logged out before render)
     *          - Calls getId() to get the current author's id 
     *          - Calls getPosts() to get the posts of the current author's following list and also public posts 
     * Returns: N/A
     */
    const [viewer, setViewerId] = useState('')
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
        /**
         * Description: Fetches the current author's id and the public and following (who the author follows) posts  
         * Returns: N/A
         */
        const getId = () => {
            /**
             * Description: Sends a POST request to get the current author's id 
             * Request: POST
             * Returns: N/A
             */
            axios
            .get('/userinfo/')
            .then((response) => {
                if (response.data !== null) {
                    setUserInfo(response.data);
                    let viewerId = response.data.authorId;
                    setViewerId(viewerId)
                }
            })
            .catch(err => { 
                if (err.response.status === 401 || err.response.status === 404) { setViewerId('') }}
            )
        }
        getId();
    }, []);

    return (
        <div>
            <TopNav authorId={viewer}/>
            <div className='pubRow'>
                <div className='pubColL'>
                    <LeftNavBar authorId={viewer}/>
                </div>
                <div className='pubColM'>
                    <Posts url={'/posts/public'} userInfo={userInfo}/>               
                </div>
                <div className='pubColR'>
                    <RightNavBar/>
                </div>
            </div>
        </div>
    )
}

export default PublicFeed;
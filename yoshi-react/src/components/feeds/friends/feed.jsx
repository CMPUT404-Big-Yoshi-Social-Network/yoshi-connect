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
import axios from 'axios';

// User Interface
import TopNav from '../navs/top/nav.jsx';
import LeftNavBar from '../navs/left/nav.jsx';
import RightNavBar from '../navs/right/nav.jsx';

// Child Component
import Posts from '../../posts/posts.jsx';

// Styling
import './feed.css';

function FriendFeed() {
    /**
     * Description: Represents a the Friend Feed 
     * Functions: 
     *     - useEffect(): Fetchs the user info associated with the Author 
     * Returns: N/A
     */
    console.log('Debug: <TLDR what the function is doing>')
    const [userInfo, setUserInfo] = useState({})

    useEffect(() => {
        /**
         * Description: Fetchs the user info associated with the Author through a GET request 
         * Request: GET    
         * Returns: 
         */
        console.log('Debug: <TLDR what the function is doing>')
        const getId = () => {
            axios
            .get('/userinfo/')
            .then((response) => {
                setUserInfo(response.data);
            })
            .catch(err => {  

            });
        }
        getId();
    }, []);

    return (
        <div>
            <TopNav authorId={userInfo.authorId}/>
            <div className='pubRow'>
                <div className='pubColL'>
                    <LeftNavBar authorId={userInfo.authorId}/>
                </div>
                <div className='pubColM'>
                    <Posts url={"/authors/" + userInfo.authorId + "/inbox"} userInfo={userInfo}/>  
                </div>
                <div className='pubColR'>
                    <RightNavBar/>
                </div>
            </div>

        </div>
    )
}

export default FriendFeed;
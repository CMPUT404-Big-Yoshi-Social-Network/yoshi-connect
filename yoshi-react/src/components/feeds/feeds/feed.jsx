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
import { useNavigate, useLocation } from 'react-router-dom';
import React, { useEffect, useState, useCallback } from "react";
import axios from 'axios';

// User Interface
import TopNav from '../navs/top/nav.jsx';
import LeftNavBar from '../navs/left/nav.jsx';
import RightNavBar from '../navs/right/nav.jsx';

// Child Component
import Posts from '../../posts/posts.jsx';

// Styling
import './feed.css';

export default function Feed() {
    /**
     * Description: Represents a Feed 
     * Functions: 
     *     - useCallback(): Logs an Author out 
     *     - useEffect(): 
     *          - Calls checkExpiry() to check if the token is expired before render
     *          - Fetches the current author's id and the public and following (who the author follows) posts
     *     - checkExpiry(): Checks if the Author has an expired token
     *     - getId(): Get the Author's id
     *     - getPosts(): Gets the current Author's followings posts and public (PSA) posts
     * Returns: N/A
     */
    const navigate = useNavigate();
    const path = useLocation().pathname;
    const [posts, setPosts] = useState([]);
    const [viewer, setViewerId] = useState({ viewerId: '' })

    const feed = ['public', 'friend'];
    let i = 0;
    if (path === '/friends/' || path === '/friends') {
        i = 1
    }

    const logOut = useCallback(() => {
        /**
         * Description: Sends a POST request in order to log out an author 
         * Request: POST
         * Returns: N/A
         */
        console.log('Debug: Attempting to log out.')

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/server/feed',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                message: 'Logging Out'
            }
        }

        axios
        .post('/server/feed', config)
        .then((response) => {
            localStorage['sessionId'] = "";
            navigate("/");
        })
        .catch(err => { console.error(err); });
    }, [navigate]);

    useEffect(() => {
        /**
         * Description: Calls checkExpiry() to check if the token is expired before render 
         * Returns: N/A
         */
        const checkExpiry = () => {
            /**
             * Description: Sends a GET request checking if the author has an expired token (if so, they will be logged out and 
             *              redirected to the Welcome component) 
             * Request: GET
             * Returns: N/A
             */
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: '/feed',
            }
    
            axios
            .get('/server/feed', config)
            .then((response) => {
                if (response.data.status === "Expired") {
                    console.log("Debug: Your token is expired.")
                    logOut();
                    navigate('/');
                } else {
                    console.log('Debug: Your token is not expired.')
                }
            })
            .catch(err => {
                if (err.response.status === 401) {
                    console.log("Debug: Not authorized.");
                    navigate('/unauthorized'); 
                }
            });
        }
        checkExpiry();
    }, [logOut, navigate]) 

    useEffect(() => {
        /**
         * Description: Fetches the current author's id and the public and following (who the author follows) posts  
         * Returns: N/A
         */
        const getId = () => {
            /**
             * Description: Sends a POST request to get the author's id 
             * Request: POST
             * Returns: N/A
             */
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: '/server/posts/',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    sessionId: localStorage.getItem('sessionId'),
                    status: 'Fetching current authorId'
                }
            }

            axios
            .post('/server/posts/', config)
            .then((response) => {
                let viewerId = response.data.authorId;
                setViewerId({ viewerId: viewerId })
            })
            .catch(err => { });
        }

        const getPosts = () => {
            /**
             * Description: Sends a POST request to get the current author's followings posts and public (PSA) posts  
             * Request: POST
             * Returns: N/A
             */
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                // eslint-disable-next-line
                url: '/server/'+feed[i]+'/posts',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }

            axios
            // eslint-disable-next-line
            .post('/server/'+feed[i]+'/posts', config)
            .then((response) => { setPosts(response.data.posts) })
            .catch(err => { console.error(err); });
        }
        getId();
        getPosts();
        // eslint-disable-next-line
    }, []);

    return (
        <div>
        <TopNav/>
        <div className='feedRow'>
            <div className='feedColL'>
                <LeftNavBar/>
            </div>
            <div className='feedColM'>
                <Posts viewerId={viewer.viewerId} posts={posts}/>
            </div>
            <div className='feedColR'>
                <RightNavBar/>
            </div>
        </div>

    </div>
    )
}
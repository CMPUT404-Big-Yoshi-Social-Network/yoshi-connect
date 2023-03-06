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
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from "react";

// User Interface
import TopNav from '../navs/top/nav.jsx';
import LeftNavBar from '../navs/left/nav.jsx';
import RightNavBar from '../navs/right/nav.jsx';

// Styling 
import './public.css';

// Child Component 
import Posts from '../../posts/posts.jsx';

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
    const navigate = useNavigate();
    const [publicPosts, setPublicPosts] = useState([]);
    const [viewer, setViewerId] = useState({ viewerId: '' })

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
                setViewerId({
                    viewerId: viewerId
                  })
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
                url: '/server/public/posts',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }

            axios
            .post('/server/public/posts', config)
            .then((response) => { setPublicPosts(response.data.publicPosts) })
            .catch(err => { console.error(err); });
        }
        getId();
        getPosts();
    }, []);

    return (
        <div>
            <TopNav/>
            <div className='pubRow'>
                <div className='pubColL'>
                    <LeftNavBar/>
                </div>
                <div className='pubColM'>
                    <Posts viewerId={viewer.viewerId} posts={publicPosts}/>
                </div>
                <div className='pubColR'>
                    <RightNavBar/>
                </div>
            </div>
        </div>
    )
}

export default PublicFeed;
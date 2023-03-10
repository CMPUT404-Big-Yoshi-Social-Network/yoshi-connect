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
import React, { useEffect, useState } from "react";
import axios from 'axios';

// User Interface
import TopNav from '../navs/top/nav.jsx';
import LeftNavBar from '../navs/left/nav.jsx';
import RightNavBar from '../navs/right/nav.jsx';

// Child Component
import Posts from '../../posts/posts.jsx';

// Styling
import './friendFeed.css';

function FriendFeed() {
    /**
     * Description: Represents the Friend Feed that displays the posts from friends as well as a friends list
     * Functions:
     *     - logOut(): Logs out the author if their token expired 
     *     - checkExpiry(): Checks if the current token is expired for the current author logged in 
     *     - useEffect(): 
     *          - Calls checkExpiry() to check a token's expiry (whether to log out author or not)
     *          - Gets the current author's id using getId() 
     *          - Gets the friends posts for the current author using getPosts() 
     *     - getId(): Gets the current logged in author's id
     *     - getPosts(): Gets the current logged in author's friends' posts 
     * Returns: N/A
     */
    const navigate = useNavigate();
    const [friendPosts, setFriendPosts] = useState([]);
    const [viewer, setViewerId] = useState({ viewerId: '' })

    useEffect(() => {
        /**
         * Description: Calls checkExpiry() to see if the author has an expired token 
         * Returns: N/A
         */
        checkExpiry();
    })

    useEffect(() => {
        /**
         * Description: 
         *     - Sends a POST request through getId() to get the authorId
         *     - Sends a POST request through getPosts to get the author's friends' posts 
         * Request: POST
         * Returns: N/A
         */
        const getId = () => {
            /**
             * Description: Sends a POST request to get the current author's id 
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
             * Description: Sends a POST request in order to get the posts of the current author's friends 
             * Request: POST
             * Returns: N/A
             * Refactor: TODO
             */
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: '/server/friends/posts',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: {
                    sessionId: localStorage.getItem('sessionId'),
                }
            }

            axios
            .post('/server/friends/posts', config)
            .then((response) => { setFriendPosts(response.data.friendPosts) })
            .catch(err => { console.error(err); });
        }

        getId();
        getPosts();
    }, []);

    const logOut = () => {
        /**
         * Description: Sends a POST request to log out the current author then navigates the author to the Welcome component 
         * Request: POST
         * Returns: N/A
         * Refactor: TODO
         */
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/server/feed',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: { message: 'Logging Out' }
        }

        axios
        .post('/server/feed', config)
        .then((response) => { localStorage['sessionId'] = ""; navigate("/"); })
        .catch(err => { });
    }

    const checkExpiry = () => {
        /**
         * Description: Sends a GET request to check if the token for the current author has expired; if so, it logs the author out and 
         *              sends them to the Welcome component and deletes their token from the localStorage 
         * Request: GET
         * Returns: N/A
         * Refactor: TODO
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
            }
            else{console.log('Debug: Your token is not expired.')}
        })
        .catch(err => {
            if (err.response.status === 401) {
                console.log("Debug: Not authorized.");
                navigate('/unauthorized'); 
            }
        });
    }

    return (
        <div>
            <TopNav/>
            <div className='pubRow'>
                <div className='pubColL'>
                    <LeftNavBar authorId={viewer.viewerId}/>
                </div>
                <div className='pubColM'>
                    <Posts viewerId={viewer.viewerId} posts={friendPosts}/>
                </div>
                <div className='pubColR'>
                    <RightNavBar/>
                </div>
            </div>

        </div>
    )
}

export default FriendFeed;
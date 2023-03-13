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
import { useNavigate } from 'react-router-dom';

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
    const [friendPosts, setFriendPosts] = useState([]);
    const [viewer, setViewerId] = useState({ viewerId: '' })
    const navigate = useNavigate();

    useEffect(() => {
        /**
         * Description: 
         *     - Sends a POST request through getId() to get the authorId
         *     - Sends a POST request through getPosts to get the author's friends' posts 
         * Request: POST
         * Returns: N/A
         */
        const getId = () => {
            axios
            .get('/api/userinfo/')
            .then((response) => {
                let viewerId = response.data.author._id;
                setViewerId({ viewerId: viewerId })
            })
            .catch(err => { if (err.response.status === 404) { 
                setViewerId('')
            } 
            });
        }
        getId();

        const getPosts = () => {
            /**
             * Description: Sends a POST request in order to get the posts of the current author's friends 
             * Request: POST
             * Returns: N/A
             */
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: '/api/authors/' + viewer.viewerId + '/friends/posts',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }

            axios
            .post('/api/authors/' + viewer.viewerId + '/friends/posts', config)
            .then((response) => { setFriendPosts(response.data.friendPosts) })
            .catch(err => {
                if (err.response.status === 401) {
                    navigate('/unauthorized');
                } else if (err.response.status === 404) {
                    setFriendPosts([]);
                }
             });
        }
        getPosts();
    }, [viewer, navigate]);

    return (
        <div>
            <TopNav authorId={viewer.viewerId}/>
            <div className='pubRow'>
                <div className='pubColL'>
                    <LeftNavBar authorId={viewer.viewerId}/>
                </div>
                <div className='pubColM'>
                    { friendPosts === undefined || friendPosts.length === 0 ? 
                        <div>
                            <h4>No posts to show.</h4>
                        </div> : 
                        <div>
                            <Posts viewerId={viewer.viewerId} posts={friendPosts}/>
                        </div>
                    }
                </div>
                <div className='pubColR'>
                    <RightNavBar/>
                </div>
            </div>

        </div>
    )
}

export default FriendFeed;
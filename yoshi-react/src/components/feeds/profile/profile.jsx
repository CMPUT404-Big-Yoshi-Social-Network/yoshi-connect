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
import { useNavigate, useParams } from 'react-router-dom';
import React, { useEffect } from "react";
import { useState, useRef } from 'react';
import axios from 'axios';

// Child Component
import TopNav from '../navs/top/nav.jsx';
import LeftNavBar from '../navs/left/nav.jsx';
import RightNavBar from '../navs/right/nav.jsx';
import Posts from '../../posts/posts.jsx';

// Styling
import './profile.css';

function Profile() {
    /**
     * Description: Represents an author's profile 
     * Functions:
     *     - useEffect(): Checks if the author is logged in before redirecting to the feeds route 
     *     - useEffect(): Gets and checks for the existing account details
     *     - getId(): Gets the author's ID and sets their viewer ID for posts
     *     - getPosts(): Get's the post details
     *     - useEffect(): Checks if the viewer has already sent a friend request
     *     - useEffect(): Checks if the author is a follower or a friend
     *     - SendRequest(): Handles sending and deleting a friend request, unfriending, and unfollowing
     *     - LogOut(): Logs the author out  
     * Returns: N/A
     */
    const { username } = useParams();
    const [personal, setPersonal] = useState({
        person: null,
        viewer: null,
        viewed: null,
        viewedId: null,
        viewerId: null
    })
    const [requestButton, setRequestButton] = useState('Add');
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();
    let exists = useRef(null);
    useEffect(() => {
        /**
         * Description: Get the account details of the author
         * Request: GET
         * Returns: N/A
         */
        let person = '';
        let viewer = '';
        let viewed = '';
        let viewedId = '';
        let viewerId = '';
        console.log('Debug: Getting account details')
        const isRealProfile = () => {
            /**
             * Description: Checks if the author account exists
             * Request: GET
             * Returns: N/A
             */
            axios
            .get('/api/profile')
            .then((response) => {
                console.log('Debug: Profile Exists.')
                person = response.data.personal
                viewer = response.data.viewer
                viewed = response.data.viewed
                viewedId = response.data.viewedId
                viewerId = response.data.viewerId
                setPersonal(prevPersonal => ({...prevPersonal, person}))
                setPersonal(prevViewer => ({...prevViewer, viewer}))
                setPersonal(prevViewed => ({...prevViewed, viewed}))
                setPersonal(prevViewedId => ({...prevViewedId, viewedId}))
                setPersonal(prevViewerId => ({...prevViewerId, viewerId}))
                getPosts(person, viewer, viewed);
            })
            .catch(err => {
                if (err.response.status === 404) {
                    console.log("Debug: Profile does not exist.");
                    navigate('/notfound'); 
                }
                else if (err.response.status === 401) {
                    console.log("Debug: Not authorized.");
                    navigate('/unauthorized'); 
                }
            });
        }
        isRealProfile();
        console.log('Debug: Getting posts')
        const getPosts = (person, viewer, viewed) => {
            /**
             * Description: Checks if the author account exists
             * Request: GET
             * Returns: N/A
             * Refactor: NEEDED UPDATE WAITING ON POST UPDATE
             */
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: '/server/users/posts',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: {
                    personal: person,
                    viewed: viewed,
                    viewer: viewer
                }
            }
            axios
            .post('/server/users/posts', config)
            .then((response) => {
                setPosts(response.data.posts)
            })
            .catch(err => {
                console.error(err);
            });
        }
    }, [navigate, username])
    useEffect(() => {
        /**
         * Description: Checks if the viewer has already sent a friend request
         * Request: POST
         * Returns: N/A
         */
        if (!personal.person) { 
            console.log('Debug: Checking if the viewer has already sent a friend request.')
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: '/server/users/' + username,
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: {
                    receiver: personal.viewed,
                    sender: personal.viewer,
                    status: 'Does Request Exist'
                }
            }
            axios
            .post('/server/users/' + username, config)
            .then((response) => {
                if (response.data.status === 'Successful') {
                    console.log('Debug: Friend Request Exists.')
                    exists.current = true;
                } else {
                    console.log('Debug: Friend Request does not exist.')
                    exists.current = false;
                }
            })
            .catch(err => {
              console.error(err);
            });
        }
    }, [username, exists, personal]);
    useEffect(() => {
        /**
         * Description: Checks if the author is a follower or a friend
         * Request: POST
         * Returns: N/A
         */
        if (!exists.current && !personal.person) {
            console.log('See if they are followers or friends.');
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: '/server/users/' + username,
                headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: {
                    viewed: personal.viewed,
                    viewer: personal.viewer,
                    status: 'Friends or Follows'
                }
            }
            axios
            .post('/server/users/' + username, config)
            .then((response) => {
                if (response.data.status === 'Friends') {
                    console.log('Debug: They are friends.')
                    setRequestButton('Unfriend');
                } else if (response.data.status === 'Follows') {
                    console.log('Debug: They are follows.')
                    setRequestButton('Unfollow');
                }
            })
            .catch(err => {
            console.error(err);
            });
        }
    }, [username, personal, exists, setRequestButton, requestButton])
    const SendRequest = () => {
        /**
         * Description: Handles sending and deleting a friend request, unfriending, and unfollowing
         * Request: PUT, DELETE
         * Returns: N/A
         */
        if (requestButton === "Add") {
            setRequestButton('Sent');
            let config = {
                method: 'put',
                maxBodyLength: Infinity,
                url: '/api/authors/' + personal.viewerId + '/followers/' + personal.viewedId,
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
            axios
            .put('/api/authors/' + personal.viewerId + '/followers/' + personal.viewedId, config)
            .then((response) => { })
            .catch(err => {
              if (err.response.status === 401) {
                navigate('/unauthorized')
              } else if (err.response.status === 400) {
                navigate('/badrequest');
              }
            });
        } else if (requestButton === "Sent") {
            setRequestButton('Add')
            let config = {
                method: 'delete',
                maxBodyLength: Infinity,
                url: '/api/authors/' + personal.viewerId + '/requests/' + personal.viewedId,
                headers: {
                  'Content-Type': 'application/json'
                }
            }
            axios
            .delete('/api/authors/' + personal.viewerId + '/requests/' + personal.viewedId, config)
            .then((response) => { })
            .catch(err => {
                if (err.response.status === 401) {
                    navigate('/unauthorized')
                  } else if (err.response.status === 400) {
                    navigate('/badrequest');
                  } else if (err.response.status === 500) {
                    console.log('NEED 500 PAGE')
                  }
            });
        } else if (requestButton === 'Unfriend') {
            console.log('Debug: We want to unfriend.')
            let config = {
                method: 'put',
                maxBodyLength: Infinity,
                url: '/server/users/' + username,
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: {
                    receiver: personal.viewed,
                    sender: personal.viewer,
                    status: 'Unfriending'
                }
            }
            axios
            .put('/server/users/' + username, config)
            .then((response) => {
                if (response.data.status) {
                    console.log('Debug: Friend is unfriended.')
                    setRequestButton('Add');
                }
            })
            .catch(err => {
              console.error(err);
            });
        } else if (requestButton === "Unfollow") {
            console.log('Debug: We want to unfollow.')
            let config = {
                method: 'delete',
                maxBodyLength: Infinity,
                url: '/api/authors/' + personal.viewerId + '/followers/' + personal.viewedId,
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
            axios
            .delete('/api/authors/' + personal.viewerId + '/followers/' + personal.viewedId, config)
            .then((response) => {
                if (response.data.status) {
                    console.log('Debug: Follow is unfollowed.')
                    setRequestButton('Add');
                }
            })
            .catch(err => {
              console.error(err);
            });
        }
    }
    return (
        <div>
            <TopNav/>
            <div className='profRow'>
                <div className='pubColL'>
                    <LeftNavBar/>
                </div>
                <div className='profColM'>
                    <h1 style={{paddingLeft: '.74em'}}>{username}'s Profile</h1>
                    { personal.person ? null : 
                        <button style={{marginLeft: '1.8em'}} className='post-buttons' type="button" id='request' onClick={() => SendRequest()}>{requestButton}</button>}
                    <h2 style={{paddingLeft: '1em'}}>Posts</h2>
                    <Posts viewerId={personal.viewerId} posts={posts}/>   
                </div>
                <div className='profColR'>
                    <RightNavBar/>
                </div>
            </div>
        </div>
    )
}

export default Profile;
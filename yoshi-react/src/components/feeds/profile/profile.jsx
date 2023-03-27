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
    const [otherUrl, setOtherUrl] = useState([]);
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
        let otherUrl = '';

        const isRealProfile = () => {
            /**
             * Description: Checks if the author account exists
             * Request: GET
             * Returns: N/A
             */
            axios
            .get('/profile/' + username)
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

                otherUrl = 'other/' + viewedId;
                setOtherUrl(prevOtherUrl => ({...prevOtherUrl, otherUrl}))
            })
            .catch(err => {
                if (err.response.status === 404) {
                    navigate('/notfound'); 
                }
                else if (err.response.status === 401) {
                    console.log("Debug: Not authorized.");
                    navigate('/unauthorized'); 
                }
            });
        }
        isRealProfile();
    }, [navigate, username])
    useEffect(() => {
        /**
         * Description: Checks if the viewer has already sent a friend request
         * Request: POST
         * Returns: N/A
         */
        if (!personal.person && personal.viewerId != null && personal.viewedId != null) { 
            console.log('Debug: Checking if the viewer has already sent a friend request.')
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: '/authors/' + personal.viewerId + '/inbox/requests/' + personal.viewedId,
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
            axios
            .get('/authors/' + personal.viewerId + '/inbox/requests/' + personal.viewedId, config)
            .then((response) => { 
                exists.current = true; 
                setRequestButton('Sent');
            })
            .catch(err => {
                if (err.response.status === 404) { exists.current = false; }
            });
        }
    }, [username, exists, personal]);
    useEffect(() => {
        /**
         * Description: Checks if the author is a follower or a friend
         * Request: POST
         * Returns: N/A
         * REFACTOR: CHECK 
         */
        if (!exists.current && !personal.person && personal.viewerId != null && personal.viewedId != null) {
            console.log('See if they are followers or friends.');
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: '/authors/' + personal.viewerId + '/friends/' + personal.viewedId,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
            axios
            .post('/authors/' + personal.viewerId + '/friends/' + personal.viewedId, config)
            .then((response) => {
                if (response.data.status === 'Friends') {
                    setRequestButton('Unfriend');
                } else if (response.data.status === 'Follows') {
                    setRequestButton('Unfollow');
                } else if (response.data.status === 'Strangers') {
                    setRequestButton('Add');
                }
            })
            .catch(err => {
                if (err.response.status === 500) { console.log('500 PAGE') }
            });
        }
    }, [username, personal, exists, requestButton])

    const SendRequest = () => {
        if (requestButton === "Add") {
            setRequestButton('Sent');
            let config = {
                method: 'put',
                maxBodyLength: Infinity,
                url: '/authors/' + personal.viewerId + '/inbox/requests/' + personal.viewedId,
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
            axios
            .put('/authors/' + personal.viewerId + '/inbox/requests/' + personal.viewedId, config)
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
            axios
            .delete('/authors/' + personal.viewerId + 'inbox/requests/' + personal.viewedId)
            .then((response) => { })
            .catch(err => {
                if (err.response.status === 401) {
                    navigate('/unauthorized')
                  } else if (err.response.status === 400) {
                    navigate('/badrequest');
                  } else if (err.response.status === 500) {
                    console.log('500 PAGE')
                  }
            });
        } else if (requestButton === 'Unfriend') {
            console.log('Debug: We want to unfriend.')
            axios
            .delete('/authors/' + personal.viewerId + '/followings/' + personal.viewedId)
            .then((response) => {
                if (response.data.status) {
                    console.log('Debug: Follow is unfriended.')
                    setRequestButton('Add');
                }
            })
            .catch(err => {
                if (err.response.status === 401) {
                    navigate('/unauthorized')
                  } else if (err.response.status === 400) {
                    navigate('/badrequest');
                  } else if (err.response.status === 500) {
                    console.log('500 PAGE')
                  }
            });
        } else if (requestButton === "Unfollow") {
            console.log('Debug: We want to unfollow.')
            let config = {
                method: 'delete',
                maxBodyLength: Infinity,
                url: '/authors/' + personal.viewerId + '/followings/' + personal.viewedId,
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
            axios
            .delete('/authors/' + personal.viewerId + '/followings/' + personal.viewedId, config)
            .then((response) => {
                if (response.data.status) {
                    console.log('Debug: Follow is unfollowed.')
                    setRequestButton('Add');
                }
            })
            .catch(err => {
                if (err.response.status === 401) {
                    navigate('/unauthorized')
                  } else if (err.response.status === 400) {
                    navigate('/badrequest');
                  } else if (err.response.status === 500) {
                    console.log('500 PAGE')
                  }
            });
        }
    }
    return (
        <div>
            <TopNav authorId={personal.viewerId}/>
            <div className='profRow'>
                <div className='pubColL'>
                    <LeftNavBar authorId={personal.viewerId}/>
                </div>
                <div className='profColM'>
                    <h1 style={{paddingLeft: '.74em'}}>{username}'s Profile</h1>
                    { personal.person ? null : 
                        <button style={{marginLeft: '1.8em'}} className='post-buttons' type="button" id='request' onClick={() => SendRequest()}>{requestButton}</button>}
                    <h2 style={{paddingLeft: '1em'}}>Posts</h2>
                    { (personal.person == null) ? null:
                        (personal.person == true ?
                        <Posts type={'personal'}/> : 
                        <Posts type={otherUrl}/>) 
                    }   
                </div>
                <div className='profColR'>
                    <RightNavBar/>
                </div>
            </div>
        </div>
    )
}

export default Profile;
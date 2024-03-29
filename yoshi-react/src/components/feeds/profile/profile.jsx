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
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
    let {state} = useLocation();
    const { username } = useParams();
    if (state === null) {
        state = {
            isRemote: false
        }
    }
    const [profileInfo, setProfileInfo] = useState({
        github: null,
        profileImage: null,
        about: null,
        pronouns: null,
        isRemote: state.isRemote
    })
    const [personal, setPersonal] = useState({
        person: null,
        viewer: null,
        viewed: null,
        viewedId: null,
        viewerId: null
    })
    const [requestButton, setRequestButton] = useState('Add');
    const [otherUrl, setOtherUrl] = useState("");
    const [userInfo, setUserInfo] = useState({})
    const navigate = useNavigate();
    let exists = useRef(null);
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
                }
            })
            .catch(err => { 
                if (err.response.status === 401 || err.response.status === 404) {  }}
            )
        }
        getId();
    }, []);

    useEffect(() => {
        /**
         * Description: Get the viewership details
         * Request: GET
         * Returns: N/A
         */
        let person = '';
        let viewer = '';
        let viewed = '';
        let viewedId = '';
        let viewerId = '';
        let numPosts = '';
        let numFollowing = '';
        let numFollowers = '';
        let otherUrl = '';

        if (!state.isRemote) {
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
                    numPosts = response.data.numPosts
                    numFollowing = response.data.numFollowing
                    numFollowers = response.data.numFollowers
                    setPersonal(prevPersonal => ({...prevPersonal, person}))
                    setPersonal(prevViewer => ({...prevViewer, viewer}))
                    setPersonal(prevViewed => ({...prevViewed, viewed}))
                    setPersonal(prevViewedId => ({...prevViewedId, viewedId}))
                    setPersonal(prevViewerId => ({...prevViewerId, viewerId}))
                    setPersonal(prevNumPosts => ({...prevNumPosts, numPosts}))
                    setPersonal(prevNumFollowing => ({...prevNumFollowing, numFollowing}))
                    setPersonal(prevNumFollowers => ({...prevNumFollowers, numFollowers}))
    
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
        }
    }, [navigate, username, state.isRemote])

    useEffect(() => {
        let github = '';
        let profileImage = '';
        let about = '';
        let pronouns = '';

        if (personal.viewedId && !state.isRemote) {
            const getProfileInfo = () => {
                /**
                 * Description: Gets account details of author
                 * Request: GET
                 * Returns: N/A
                 */
                console.debug("Debug: Getting user profile info");
                axios
                .get('/authors/' + personal.viewedId)
                .then((response) => {
                    console.log("Debug: Received user profile info");
                    console.log("Profile Info", response.data);
                    github = response.data.github
                    profileImage = response.data.profileImage
                    about = response.data.about
                    pronouns = response.data.pronouns
                    setProfileInfo(prevGithub => ({...prevGithub, github}))
                    setProfileInfo(prevProfileImage => ({...prevProfileImage, profileImage}))
                    setProfileInfo(prevAbout => ({...prevAbout, about}))
                    setProfileInfo(prevPronouns => ({...prevPronouns, pronouns}))
                })
                .catch(err => {
                    if (err.response.status === 404) {
                        navigate('/notfound');
                    }
                    else if (err.response.status === 401) {
                        navigate('/notauthorized');
                    }
                    else if (err.response.status === 500) {
                        navigate('/servererror');
                    }
                })
            }
            getProfileInfo();
        }
    }, [navigate, personal, state.isRemote])

    useEffect(() => {
        /**
         * Description: Checks if the viewer has already sent a friend request
         * Request: POST
         * Returns: N/A
         */
        if (!personal.person && personal.viewerId != null && personal.viewedId != null && !state.isRemote) { 
            console.log('Debug: Checking if the viewer has already sent a friend request.')
            axios
            .get('/authors/' + personal.viewerId + '/inbox/requests/' + personal.viewedId)
            .then((response) => { 
                exists.current = true; 
                setRequestButton('Sent');
            })
            .catch(err => {
                if (err.response.status === 404) { exists.current = false; }
            });
        }
    }, [personal, state.isRemote]);

    useEffect(() => {
        /**
         * Description: Checks if the author is a follower or a friend
         * Request: POST
         * Returns: N/A
         * REFACTOR: CHECK 
         */
        if (!exists.current && !personal.person && personal.viewerId != null && personal.viewedId != null && !state.isRemote) {
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
                if (err.response.status === 500) { navigate('/servererror') }
            });
        }
    }, [navigate, personal, exists, state.isRemote])

    const SendRequest = () => {
        /**
         * Description: Handles sending and deleting a friend request, unfriending, and unfollowing
         * through a PUT request  
         * Request: PUT    
         * Returns: N/A
         */
        if (requestButton === "Add") { 
            setRequestButton('Sent');
            let url = '/authors/' + personal.viewedId + '/inbox'
            let config = {
                actor: {
                    id: 'https://yoshi-connect.herokuapp.com/authors/' + personal.viewerId,
                    status: 'local'
                },
                type: 'follow'
            }
            axios
            .post(url, config, {
                "X-Requested-With": "XMLHttpRequest"
            })
            .then((response) => { })
            .catch(err => { });
        } else if (requestButton === "Sent") {
            setRequestButton('Add')
            axios
            .delete('/authors/' + personal.viewedId + '/inbox/requests/' + personal.viewerId)
            .then((response) => { })
            .catch(err => { });
        } else if (requestButton === 'Unfriend' || requestButton === "Unfollow") {
            axios
            .delete('/authors/' + personal.viewerId + '/followings/' + personal.viewedId)
            .then((response) => { })
            .catch(err => { });
            setRequestButton('Add')
        } 
    }
    return (
        <div>
            <TopNav authorId={userInfo.authorId}/>
            <div className='profRow'>
                <div className='pubColL'>
                    <LeftNavBar authorId={personal.viewerId}/>
                </div>
                <div className='profColM'>
                    { (profileInfo.profileImage === '' || profileInfo.profileImage === null) ? <img className='profile-image' src='/images/public/icon_profile.png'  alt='prof-userimg'/> : <img className='profile-image' src={profileInfo.profileImage} alt='prof-userimg' width={125}/>}
                    <h1 className='profile-username'>{username}</h1>
                    <p className='profile-pronouns' >{profileInfo.pronouns}</p>
                    { (state.isRemote || personal.person) ? null : 
                        <button className='profile-buttons' type="button" id='request' onClick={() => SendRequest()}>{requestButton}</button>
                    }
                    { !state.isRemote ? 
                        <div>
                            <p className='profile-num1'>{personal.numPosts} Posts</p> 
                            <p className='profile-num2'>{personal.numFollowing} Following</p> 
                            <p className='profile-num3'>{personal.numFollowers} Followers</p>
                            <p className='profile-about'>{profileInfo.about}</p>
                        </div> : 
                        null
                    }
                    
                    <hr className='profile-hr'/>
                    <br/>
                    {
                        personal.person === true ? <Posts url={'personal'} userInfo={userInfo}/> : 
                        state.isRemote === true ? <Posts url={state.url ? state.url : otherUrl.otherUrl} userInfo={userInfo}/> :
                        personal.person === false ? <Posts url={otherUrl.otherUrl} userInfo={userInfo}/> : null

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
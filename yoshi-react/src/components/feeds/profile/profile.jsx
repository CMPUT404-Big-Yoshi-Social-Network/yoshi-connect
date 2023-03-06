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
    const { username } = useParams();
    const [personal, setPersonal] = useState({
        person: null,
        viewer: null,
        viewed: null,
        viewerId: null
    })
    const [requestButton, setRequestButton] = useState('Add');
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();
    let exists = useRef(null);
    useEffect(() => {
        const checkExpiry = () => {
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
                    LogOut();
                    navigate('/');
                }
                else{console.log('Debug: Your token is not expired.')}
            })
            .catch(err => {
                if (err.response.status === 401) {
                    console.log("Debug: Not authorized.");
                    navigate('/unauthorized'); // 401 Not Found
                }
            });
        }
        checkExpiry();
    })
    useEffect(() => {
        let person = '';
        let viewer = '';
        let viewed = '';
        console.log('Debug: Getting account details')
        const isRealProfile = () => {
            axios
            .get('/server/users/' + username)
            .then((response) => {
                console.log('Debug: Profile Exists.')
                person = response.data.personal
                viewer = response.data.viewer
                viewed = response.data.viewed
                setPersonal(prevPersonal => ({...prevPersonal, person}))
                setPersonal(prevViewer => ({...prevViewer, viewer}))
                setPersonal(prevViewing => ({...prevViewing, viewed}))
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
        const getId = () => {
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
                setPersonal(prevViewerId => ({...prevViewerId, viewerId}))
            })
            .catch(err => { });
        }
        getId();
        console.log('Debug: Getting posts')
        const getPosts = (person, viewer, viewed) => {
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
                setPosts(undefined);
            });
        }
    }, [navigate, username])
    useEffect(() => {
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
              exists.current = false;
            });
        }
    }, [username, exists, personal]);
    useEffect(() => {
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
                setRequestButton('Add')
            });
        }
    }, [username, personal, exists, setRequestButton, requestButton])
    const SendRequest = () => {
        if (requestButton === "Add") {
            setRequestButton('Sent');
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
                    status: 'Save Request'
                }
            }
            axios
            .put('/server/users/' + username, config)
            .then((response) => {
                console.log('Debug: Friend request sent!')
            })
            .catch(err => {
              console.log('Debug: Friend request not sent!')
            });
        } else if (requestButton === "Sent") {
            setRequestButton('Add')
            let config = {
                method: 'delete',
                maxBodyLength: Infinity,
                url: '/server/users/' + username,
                headers: {
                  'Content-Type': 'application/json'
                },
                data: {
                    receiver: personal.viewed,
                    sender: personal.viewer,
                    status: 'Delete Request'
                }
            }
            axios
            .delete('/server/users/' + username, config)
            .then((response) => {
                console.log('Debug: Friend request deleted!')
            })
            .catch(err => {
              console.log('Debug: Friend request not deleted!')
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
              setRequestButton('Unfriend');
            });
        } else if (requestButton === "Unfollow") {
            console.log('Debug: We want to unfollow.')
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
                    status: 'Unfollowing'
                }
            }
            axios
            .put('/server/users/' + username, config)
            .then((response) => {
                if (response.data.status) {
                    console.log('Debug: Follow is unfollowed.')
                    setRequestButton('Add');
                }
            })
            .catch(err => {
              setRequestButton('Unfollow')
            });
        }
    }
    const LogOut = () => {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/server/feed',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                status: 'Logging Out'
            }
        }
        axios
        .post('/server/feed', config)
        .then((response) => {
            localStorage['sessionId'] = "";
            navigate("/");
        })
        .catch(err => {
          console.log('Debug: Did not log out')
        });
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
                        <button style={{marginLeft: '1.8em'}} type="button" id='request' onClick={() => SendRequest()}>{requestButton}</button>}
                    <h2 style={{paddingLeft: '1em'}}>Posts</h2>
                    <Posts viewerId={personal.viewerId} posts={posts}/>   
                </div>
                <div className='profColR'>
                    <RightNavBar/>
                </div>
            </div>
        </div>
            /* <h1>{username}'s Profile</h1>
            { personal.person ? null : 
                <button type="button" id='request' onClick={() => SendRequest()}>{requestButton}</button>}
            <h2>Posts</h2>
            <Posts viewerId={personal.viewerId} posts={posts}/>   
        </div>  */
    )
}

export default Profile;
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

import { useNavigate, useParams } from 'react-router-dom';
import React, { useEffect } from "react";
import { useState, useRef } from 'react';
import axios from 'axios';
import Requests from './requests.jsx';
function Profile() {
    const { username } = useParams();
    const url = '/server/users/' + username;
    const [personal, setPersonal] = useState({
        person: null,
        viewer: null,
        viewed: null
    })

    let addButton = document.getElementById("request");
    let exists = useRef(null);
    let friends = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        let person = null;
        const isRealProfile = () => {
            axios
            .get(url)
            .then((response) => {
                console.log('Debug: Profile Exists.')
                person = response.data.personal
                const viewer = response.data.viewer
                const viewed = response.data.viewed
                setPersonal(prevPersonal => ({...prevPersonal, person}))
                setPersonal(prevViewer => ({...prevViewer, viewer}))
                setPersonal(prevViewing => ({...prevViewing, viewed}))
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
        if (!person) { 
            console.log('Debug: Checking if the viewer has already sent a friend request.')
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: url,
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
            .post(url, config)
            .then((response) => {
                if (response.data.status) {
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

        if (!exists.current && !person) {
            console.log('See if they are followers or friends.');
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: url,
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
            .post(url, config)
            .then((response) => {
                if (response.data.status) {
                    console.log('Debug: They are friends.')
                    friends.current = true;
                } else if (!response.data.status) {
                    console.log('Debug: They are follows.')
                    friends.current = false;
                }
            })
            .catch(err => {
              console.error(err);
            });
        }
    }, [username, exists, personal.viewed, personal.viewer, navigate, url]);
    const SendRequest = () => {
        if (addButton.innerText === "Add Friend") {
            addButton.innerText = "Sent!";
            let config = {
                method: 'put',
                maxBodyLength: Infinity,
                url: url,
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
            .put(url, config)
            .then((response) => {
                console.log('Debug: Friend request sent!')
            })
            .catch(err => {
              console.error(err);
            });
        } else if ((addButton.innerText === "Sent!")) {
            addButton.innerText = "Add Friend";
            let config = {
                method: 'delete',
                maxBodyLength: Infinity,
                url: url,
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
            .delete(url, config)
            .then((response) => {
                console.log('Debug: Friend request deleted!')
            })
            .catch(err => {
              console.error(err);
            });
        } else if (addButton.innerText === "Unfriend") {
            console.log('Debug: We want to unfriend.')
            let config = {
                method: 'put',
                maxBodyLength: Infinity,
                url: url,
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
            .put(url, config)
            .then((response) => {
                if (response.data.status) {
                    console.log('Debug: Friend is unfriended.')
                    addButton.innerText = "Add Friend";
                }
            })
            .catch(err => {
              console.error(err);
            });
        } else if (addButton.innerText === "Unfollow") {
            console.log('Debug: We want to unfollow.')
            let config = {
                method: 'put',
                maxBodyLength: Infinity,
                url: url,
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
            .put(url, config)
            .then((response) => {
                if (response.data.status) {
                    console.log('Debug: Follow is unfollowed.')
                    addButton.innerText = "Add Friend";
                }
            })
            .catch(err => {
              console.error(err);
            });
        }
    }
    return (
        <div>
            You are viewing profile. Welcome to {username}'s profile!
            { personal.person ? null : exists.current ? <button type="button" id='request' onClick={() => SendRequest()}>Sent!</button> : friends.current ? <button type="button" id='request' onClick={() => SendRequest()}>Unfriend</button> : friends.current === false ? <button type="button" id='request' onClick={() => SendRequest()}>Unfollow</button> : <button type="button" id='request' onClick={() => SendRequest()}>Add Friend</button>}
            <br></br>
            { personal.person ? <div><Requests username={username}/></div> : null }
        </div> 
    )
}

export default Profile;
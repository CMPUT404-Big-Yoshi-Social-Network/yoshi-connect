import { useNavigate, useParams } from 'react-router-dom';
import React, { useEffect } from "react";
import { useState, useRef } from 'react';
import axios from 'axios';
function Profile() {
    const { username } = useParams();
    const [personal, setPersonal] = useState({
        person: null,
        viewer: null,
        viewed: null
    })
    const navigate = useNavigate();
    let addButton = document.getElementById("request");
    let exists = useRef(null);
    let friends = useRef(null);
    useEffect(() => {
        let person = null;
        const isRealProfile = () => {
            axios
            .get('/server/users/' + username)
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

        if (!exists.current && !person) {
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
                    friends.current = true;
                } else if (response.data.status === 'Follows') {
                    console.log('Debug: They are follows.')
                    friends.current = false;
                }
            })
            .catch(err => {
              console.error(err);
            });
        }
    }, [username, exists, personal.viewed, personal.viewer, navigate]);
    const SendRequest = () => {
        if (addButton.innerText === "Add Friend") {
            addButton.innerText = "Sent!";
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
                    status: 'Save Request'
                }
            }
            axios
            .post('/server/users/' + username, config)
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
              console.error(err);
            });
        } else if (addButton.innerText === "Unfriend") {
            console.log('Debug: We want to unfriend.')
        } else if (addButton.innerText === "Unfollow") {
            console.log('Debug: We want to unfollow.')
        }
    }
    return (
        <div>
            You are viewing profile. Welcome to {username}'s profile!
            { personal.person ? null : exists.current ? <button type="button" id='request' onClick={() => SendRequest()}>Sent!</button> : friends.current ? <button type="button" id='request' onClick={() => SendRequest()}>Unfriend</button> : friends.current === false ? <button type="button" id='request' onClick={() => SendRequest()}>Unfollow</button> : <button type="button" id='request' onClick={() => SendRequest()}>Add Friend</button>}
        </div> 
    )
}

export default Profile;
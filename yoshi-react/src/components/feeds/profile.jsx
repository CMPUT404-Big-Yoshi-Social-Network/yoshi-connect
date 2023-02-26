import { useNavigate, useParams } from 'react-router-dom';
import React, { useEffect } from "react";
import { useState } from 'react';
import axios from 'axios';
function Profile() {
    const { username } = useParams();
    const [personal, setPersonal] = useState({
        person: null,
        viewer: null,
        viewed: null
    })
    const navigate = useNavigate();
    useEffect(() => {
        const isRealProfile = () => {
            axios
            .get('/server/users/' + username)
            .then((response) => {
                console.log('Debug: Profile Exists.')
                const person = response.data.personal
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
    }, [username, navigate]);
    const SendRequest = () => {
        let addButton = document.getElementById("request");
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
        } else {
            addButton.innerText = "Add Friend";
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
                    status: 'Delete Request'
                }
            }
            axios
            .post('/server/users/' + username, config)
            .then((response) => {
                console.log('Debug: Friend request deleted!')
            })
            .catch(err => {
              console.error(err);
            });
        }
    }
    return (
        <div>
            You are viewing profile. Welcome to {username}'s profile!
            { personal.person ? null : <button type="button" id='request' onClick={() => SendRequest()}>Add Friend</button>}
        </div> 
    )
}

export default Profile;
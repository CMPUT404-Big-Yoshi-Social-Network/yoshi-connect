import { useNavigate, useParams } from 'react-router-dom';
import React, { useEffect } from "react";
import { useState } from 'react';
import axios from 'axios';
function Profile() {
    const { username } = useParams();
    const [personal, setPersonal] = useState({
        person: null
    })
    const navigate = useNavigate();
    useEffect(() => {
        const isRealProfile = () => {
            axios
            .get('/server/users/' + username)
            .then((response) => {
                console.log('Debug: Profile Exists.')
                const person = response.data.personal
                setPersonal(prevPersonal => ({...prevPersonal, person}))
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
        } else {
            addButton.innerText = "Add Friend";
        }
    }
    return (
        <div>
            You are viewing profile. Welcome to {username}'s profile!
            { {...personal.person === false} ? <button type="button" id='request' onClick={() => SendRequest()}>Add Friend</button> : null}
        </div> 
    )
}

export default Profile;
import { useNavigate, useParams } from 'react-router-dom';
import React, { useEffect } from "react";
import { useState } from 'react';
import axios from 'axios';
function Profile() {
    const { username } = useParams();
    const [personal, setPersonal] = useState(null)
    const navigate = useNavigate();
    useEffect(() => {
        const isRealProfile = () => {
            axios
            .get('/server/users/' + username)
            .then((response) => {
                console.log('Debug: Profile Exists.')
                console.log(response)
                setPersonal(response.data.personal);
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
    }, [username, personal, navigate]);
    const ChangeFriendState = () => {
        ;
    }
    return (
        <div>
            You are viewing profile. Welcome to {username}'s profile!
            { !{personal} ? <button type="button" id='friend' onClick={() => ChangeFriendState()}>Need to Change Between UnFriend and Add Friend</button> : null}
        </div> 
    )
}

export default Profile;
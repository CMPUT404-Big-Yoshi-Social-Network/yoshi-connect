import { useNavigate, useParams } from 'react-router-dom';
import React, { useEffect } from "react";
import axios from 'axios';
import './main.css';
function Profile() {
    const { username } = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        const isRealProfile = () => {
            axios
            .get('/server/users/' + username)
            .then((response) => {
                console.log('Debug: Profile Exists.')
            })
            .catch(err => {
                if (err.response.status === 404) {
                    console.log("Debug: Profile does not exist.");
                    navigate('/notfound'); // 404 Not Found
                }
                else if (err.response.status === 401) {
                    console.log("Debug: Not authorized.");
                    navigate('/unauthorized'); // 401 Not Found
                }
            });
        }

        isRealProfile();
    }, [username, navigate]);

    return (
        <div>
            You are viewing profile. Welcome to {username}'s profile!
        </div> 
    )
}

export default Profile;
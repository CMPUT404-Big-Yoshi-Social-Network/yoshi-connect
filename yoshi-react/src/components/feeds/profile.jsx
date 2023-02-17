import { useNavigate, useParams } from 'react-router-dom';
import React, { useEffect } from "react";
import axios from 'axios';
function Profile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const checkExpiry = () => {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                token: window.localStorage.getItem('token'),
                message: 'Checking expiry'
            }
        }
        axios
        .post('/' + username, config)
        .then((response) => {
            if (response.data.status === "Expired") {
                console.log("Debug: Your token is expired.")
                alert("You login is not cached anymore, sorry! Please log in again.")
                navigate('/');
            }
            console.log('Debug: Your token is not expired.')
        })
        .catch(err => {
          console.error(err);
        });
    }
    useEffect(() => {
       checkExpiry();
    });
    useEffect(() => {
        const isRealProfile = () => {
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: '/'
            }
            axios
            .get('/' + username, config)
            .then((response) => {
                if (response.status === 404) {
                    console.log("Debug: Profile does not exist.");
                    navigate('/notfound'); // 404 Not Found
                } 
                else {
                    console.log('Debug: Profile Exists.')
                }
            })
            .catch(err => {
              console.error(err);
              if (err.response.status === 404) {
                console.log("Debug: Profile does not exist.");
                navigate('/notfound'); // 404 Not Found
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
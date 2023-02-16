import { useNavigate, useParams } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import axios from 'axios';
function Profile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [personal, setPersonal] = useState(null);
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
        /*
        let isLogged = loggedIn();
        if (isLogged) {
            checkExpiry();
        }
        */
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
                console.log(response.status)
                if (response.status == 404) {
                    console.log("Debug: Profile does not exist.");
                    navigate('/notfound'); // 404 Not Found
                } 
                else {
                    console.log('Debug: Profile Exists.')
                }
            })
            .catch(err => {
              console.error(err);
              if (err.response.status == 404) {
                console.log("Debug: Profile does not exist.");
                navigate('/notfound'); // 404 Not Found
            }
            });
        }

        isRealProfile();
    }, [username, navigate]);
    /*
    useEffect(() => {
        const isPersonal = () => {
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: '/:username'
            }
            axios
            .get('/:username', config)
            .then((response) => {
                if (response.data.personal === true) {
                    console.log("Debug: You are viewing your own account.")
                    setPersonal(true);
                } else {
                    console.log("Debug: You are viewing someone else's account.")
                    setPersonal(false);
                }
            })
            .catch(err => {
              console.error(err);
            });
        }
        isPersonal();
    }, [setPersonal, username]);
    
    const LogOut = () => {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                message: 'Logging Out'
            }
        }
        axios
        .post('/feed', config)
        .then((response) => console.log(response))
        .catch(err => {
          console.error(err);
        });
    }
    */
    // Check for personal state: 
    console.log("We are viewing our own profile, true or false? > " + personal);
    return (
        <div>
            You are viewing profile. Welcome to {username}'s profile!
        </div> 
    )
}

export default Profile;
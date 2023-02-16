import { useNavigate, useParams } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import axios from 'axios';
function Profile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [personal, setPersonal] = useState(null);
    const loggedIn = () => {
        const token = localStorage.getItem('token');
        if (token === null) {
            console.log("Debug: You are not logged in.")
            return navigate('/unauthorized');
        }
        console.log("Debug: You are logged in.")
        return true;
    }
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
        .post('/:username', config)
        .then((response) => {
            if (response.data.status === "Expired") {
                console.log("Debug: Your token is expired.")
                alert("You login is not cached anymore, sorry! Please log in again.")
                LogOut();
                navigate('/');
            }
            console.log('Debug: Your token is not expired.')
        })
        .catch(err => {
          console.error(err);
        });
    }
    useEffect(() => {
        let isLogged = loggedIn();
        if (isLogged) {
            checkExpiry()
        }
    });
    useEffect(() => {
        const isPersonal = () => {
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: '/:username',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: {
                    token: window.localStorage.getItem('token'),
                    message: 'Is it Personal'
                }
            }
            axios
            .post('/:username', config)
            .then((response) => {
                if (response.data.username === username) {
                    console.log("Debug: You are viewing your own account.")
                    return true;
                }
                console.log("Debug: You are viewing someone else's account.")
            })
            .catch(err => {
              console.error(err);
            });
        }

        setPersonal(isPersonal())
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
                token: window.localStorage.getItem('token'),
                message: 'Logging Out'
            }
        }
        window.localStorage.removeItem('token');
        axios
        .post('/feed', config)
        .then((response) => console.log(response))
        .catch(err => {
          console.error(err);
        });
    }
    return (
        <div>
            You are viewing profile. Welcome to {username}'s profile! Set state: {personal}. 
        </div> 
    )
}

export default Profile;
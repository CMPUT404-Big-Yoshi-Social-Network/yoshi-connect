import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import React, { useEffect } from "react";
function PublicFeed() {
    const navigate = useNavigate();
    const checkForAuthor = () => {
        const token = localStorage.getItem('token');
        if (token === 'undefined') {
            console.log("Debug: You are not logged in.")
            alert("You are not logged in. Please log in!")
            return navigate('/login');
        }
        console.log("Debug: You are logged in.")
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
        .post('/feed', config)
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
        checkForAuthor();
        checkExpiry();
    });
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
        window.localStorage.setItem('token', 'undefined');
        axios
        .post('/feed', config)
        .then((response) => console.log(response))
        .catch(err => {
          console.error(err);
        });
    }
    return (
        <div>
            Welcome to the Public Feed. You are signed in.
            <a href="/" onClick={LogOut}>Log Out</a>
        </div> 
    )
}

export default PublicFeed;
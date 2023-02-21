import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import React, { useEffect } from "react";
import MainNav from './mainNav.jsx';
import LogOut from './logOut.js';

function PublicFeed() {
    const navigate = useNavigate();
    const checkExpiry = () => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: '/feed',
        }
        axios
        .get('/server/feed', config)
        .then((response) => {
            if (response.data.status === "Expired") {
                console.log("Debug: Your token is expired.")
                LogOut();
                navigate('/');
            }
            else{console.log('Debug: Your token is not expired.')}
        })
        .catch(err => {
            if (err.response.status === 401) {
                console.log("Debug: Not authorized.");
                navigate('/unauthorized'); // 401 Not Found
            }
        });
    }
    useEffect(() => {
       checkExpiry();
    });
    return (
        <div>
            <div>
                <MainNav/>
            </div>
            Welcome to the Public Feed. You are signed in.
            <button type="button">Log Out</button>
        </div>
    )
}

export default PublicFeed;
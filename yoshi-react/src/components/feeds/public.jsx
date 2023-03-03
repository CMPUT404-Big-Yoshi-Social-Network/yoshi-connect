import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import React, { useEffect } from "react";
import Notifications from './notifcation-box.jsx';

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
    const LogOut = () => {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/server/feed',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                message: 'Logging Out'
            }
        }
        axios
        .post('/server/feed', config)
        .then((response) => {
            navigate("/");
        })
        .catch(err => {
          console.error(err);
        });

    }
    return (
        <div>
            Welcome to the Public Feed. You are signed in.
            <button type="button" onClick={() => LogOut()}>Log Out</button>
            <Notifications/>
        </div>
    )
}

export default PublicFeed;
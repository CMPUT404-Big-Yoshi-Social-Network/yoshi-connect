import { useNavigate } from 'react-router-dom';
import React, { useEffect } from "react";
function FriendFeed() {
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
            Welcome to the Friend Feed. You are signed in.
        </div>
    )
}

export default FriendFeed;
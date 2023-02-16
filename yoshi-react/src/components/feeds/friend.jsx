import { useNavigate } from 'react-router-dom';
import React, { useEffect } from "react";
function FriendFeed() {
    const navigate = useNavigate();
    const checkForAuthor = () => {
        const token = localStorage.getItem('token');
        if (token === null) {
            console.log("Debug: You are not logged in.")
            return navigate('/unauthorized');
        }
        console.log("Debug: You are logged in.")
    }
    useEffect(() => {
        checkForAuthor();
    });
    return (
        <div>
            Welcome to the Friend Feed. You are signed in.
        </div>
    )
}

export default FriendFeed;
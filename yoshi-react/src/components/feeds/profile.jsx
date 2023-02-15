import { useNavigate, useParams } from 'react-router-dom';
import React, { useEffect } from "react";
function Profile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const loggedIn = () => {
        const token = localStorage.getItem('token');
        if (token === 'undefined') {
            console.log("Debug: You are not logged in.")
            alert("You are not logged in. Please log in!")
            return navigate('/login');
        }
        console.log("Debug: You are logged in.")
    }
    useEffect(() => {
        loggedIn();
    });
    return (
        <div>
            You are viewing profile. Welcome to {username}'s profile!
        </div> 
    )
}

export default Profile;
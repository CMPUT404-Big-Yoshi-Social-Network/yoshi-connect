import { useNavigate } from 'react-router-dom';
import React, { useEffect } from "react";
function Settings() {
    const navigate = useNavigate();
    const loggedIn = () => {
        const token = localStorage.getItem('token');
        if (token === null) {
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
            You are viewing your settings.
        </div> 
    )
}

export default Settings;
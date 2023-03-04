import { useNavigate } from 'react-router-dom';
import React, { useEffect } from "react";
import './settings.css';
function Settings() {
    const navigate = useNavigate();
    const loggedIn = () => {
        const token = localStorage.getItem('token');
        if (token === null) {
            console.log("Debug: You are not logged in.")
            return navigate('/login');
        }
        console.log("Debug: You are logged in.")
    }
    useEffect(() => {
        loggedIn();
    });
    return (
        <div>
            You are viewing your settings. DEFAULT SHOULD BE ACCOUNT DETAILS!
        </div> 
    )
}

export default Settings;
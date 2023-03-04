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
            <TopNav/>
            <div className='pubRow'>
                <div className='pubColL'>
                    <LeftNavBar/>
                </div>
                <div className='pubColM'>
                    You are viewing your settings. DEFAULT SHOULD BE ACCOUNT DETAILS!
                </div>
                <div className='pubColR'>
                    <RightNavBar/>
                </div>
            </div>
        </div>
    )
}

export default Settings;
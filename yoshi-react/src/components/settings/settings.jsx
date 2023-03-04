import { useNavigate } from 'react-router-dom';
import React, { useEffect } from "react";
import TopNav from '../feeds/topNav';
import LeftNavBar from '../feeds/leftNav.jsx';
import RightNavBar from '../feeds/rightNav.jsx';
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
        <div className='settings'>
            <TopNav/>
            <div className='pubRow'>
                <div className='pubColL'>
                    <LeftNavBar/>
                </div>
                <div className='pubColM'>
                    You are viewing your settings. DEFAULT SHOULD BE ACCOUNT DETAILS!
                    <Image fluid src='/images/icon_profile.png' alt='profile icon' width={20}></Image>
                </div>
                <div className='pubColR'>
                    <RightNavBar/>
                </div>
            </div>
        </div>
    )
}

export default Settings;
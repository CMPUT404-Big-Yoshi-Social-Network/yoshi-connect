import { useNavigate } from 'react-router-dom';
import React, { useEffect } from "react";
import TopNav from './topNav.jsx';
import LeftNavBar from './leftNav.jsx';
import RightNavBar from './rightNav.jsx';
import './friend.css';
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
            <TopNav/>
            <div className='pubRow'>
                <div className='pubColL'>
                    <LeftNavBar/>
                </div>
                <div className='pubColM'>
                        This is the friends feed!
                </div>
                <div className='pubColR'>
                    <RightNavBar/>
                </div>
            </div>
        </div>
    )
}

export default FriendFeed;
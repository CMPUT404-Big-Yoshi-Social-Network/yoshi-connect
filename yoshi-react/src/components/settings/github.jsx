import { useNavigate } from 'react-router-dom';
import React, { useEffect } from "react";
import TopNav from '../feeds/topNav';
import LeftNavBar from '../feeds/leftNav.jsx';
import RightNavBar from '../feeds/rightNav.jsx';
import './github.css';
function GitHub() {
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
                    Viewing GitHub details
                </div>
                <div className='pubColR'>
                    <RightNavBar/>
                </div>
            </div>
        </div>
    )
}

export default GitHub;
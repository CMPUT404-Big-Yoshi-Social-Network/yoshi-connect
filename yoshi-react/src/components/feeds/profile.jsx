import { useNavigate, useParams } from 'react-router-dom';
import React, { useEffect } from "react";
import axios from 'axios';
import TopNav from './topNav.jsx';
import LeftNavBar from './leftNav.jsx';
import RightNavBar from './rightNav.jsx';

function Profile() {
    const { username } = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        const isRealProfile = () => {
            axios
            .get('/server/users/' + username)
            .then((response) => {
                console.log('Debug: Profile Exists.')
            })
            .catch(err => {
                if (err.response.status === 404) {
                    console.log("Debug: Profile does not exist.");
                    navigate('/notfound'); // 404 Not Found
                }
                else if (err.response.status === 401) {
                    console.log("Debug: Not authorized.");
                    navigate('/unauthorized'); // 401 Not Found
                }
            });
        }

        isRealProfile();
    }, [username, navigate]);

    return (
        <div>
            <TopNav/>
            <div className='pubRow'>
                <div className='pubColL'>
                    <LeftNavBar/>
                </div>
                <div className='pubColM'>
                    You are viewing profile. Welcome to {username}'s profile!
                </div>
                <div className='pubColR'>
                    <RightNavBar/>
                </div>
            </div>
        </div>
    )
}

export default Profile;
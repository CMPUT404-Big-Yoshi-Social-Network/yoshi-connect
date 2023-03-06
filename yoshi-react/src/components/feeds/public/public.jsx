/*
Copyright 2023 Kezziah Camille Ayuno, Alinn Martinez, Tommy Sandanasamy, Allan Ma, Omar Niazie

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.


Furthermore it is derived from the Python documentation examples thus
some of the code is Copyright © 2001-2013 Python Software
Foundation; All Rights Reserved
*/

// Functionality
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from "react";

// Child Component
import TopNav from '../navs/top/nav.jsx';
import LeftNavBar from '../navs/left/nav.jsx';
import RightNavBar from '../navs/right/nav.jsx';
// import Notifications from './notifcation-box.jsx';
// import CreatePost from '../posts/create.jsx';
import Posts from '../../posts/posts.jsx';
// import Following from './following.jsx';

// Styling
import './public.css';

function PublicFeed() {
    const navigate = useNavigate();
    const [publicPosts, setPublicPosts] = useState([]);
    const [viewer, setViewerId] = useState({
        viewerId: '',
    })
    const LogOut = useCallback(() => {
        console.log('Debug: Attempting to log out.')
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/server/feed',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                message: 'Logging Out'
            }
        }
        axios
        .post('/server/feed', config)
        .then((response) => {
            localStorage['sessionId'] = "";
            navigate("/");
        })
        .catch(err => {
          console.error(err);
        });
    }, [navigate]);
    useEffect(() => {
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

        checkExpiry();
    }, [LogOut, navigate]) 

    useEffect(() => {
        const getId = () => {
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: '/server/posts/',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    sessionId: localStorage.getItem('sessionId'),
                    status: 'Fetching current authorId'
                }
            }
            axios
            .post('/server/posts/', config)
            .then((response) => {
                let viewerId = response.data.authorId;
                setViewerId({
                    viewerId: viewerId
                  })
            })
            .catch(err => { });
        }

        const getPosts = () => {
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: '/server/public/posts',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
            axios
            .post('/server/public/posts', config)
            .then((response) => {
                setPublicPosts(response.data.publicPosts)
            })
            .catch(err => {
                console.error(err);
            });
        }

        getId();
        getPosts();
    }, []);

    return (
        <div>
            <TopNav/>
            <div className='pubRow'>
                <div className='pubColL'>
                    <LeftNavBar/>
                </div>
                <div className='pubColM'>
                    <Posts viewerId={viewer.viewerId} posts={publicPosts}/>
                </div>
                <div className='pubColR'>
                    <RightNavBar/>
                </div>
            </div>
            {/* <h1>Public Feed</h1>
            <button type="button" onClick={() => LogOut()}>Log Out</button>
            {/* <CreatePost/> */}
            {/* <Notifications/> */}
            {/* <Following/> */}
        </div>
    )
}

export default PublicFeed;
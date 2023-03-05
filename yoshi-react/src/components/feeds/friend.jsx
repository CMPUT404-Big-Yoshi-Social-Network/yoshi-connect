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

import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import axios from 'axios';
import Friends from './friends.jsx';
import Posts from '../posts/posts.jsx';


function FriendFeed() {
    const navigate = useNavigate();
    const [friendPosts, setFriendPosts] = useState([]);
    const [viewer, setViewerId] = useState({
        viewerId: '',
    })
    const LogOut = () => {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/feed',
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
    }

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
                navigate('/unauthorized'); 
            }
        });
    }

    useEffect(() => {
        checkExpiry();
    })
    useEffect(() => {
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
                ...viewer,
                viewerId: viewerId
              })
        })
        .catch(err => { });

       console.log('Debug: Fetching all the friends post of this author');
       config = {
           method: 'post',
           maxBodyLength: Infinity,
           url: '/server/friends/posts',
           headers: {
               'Content-Type': 'application/x-www-form-urlencoded'
           },
           data: {
               sessionId: localStorage.getItem('sessionId'),
           }
       }
       axios
       .post('/server/friends/posts', config)
       .then((response) => {
           setFriendPosts(response.data.friendPosts)
       })
       .catch(err => {
           console.error(err);
       });

    }, [setFriendPosts, setViewerId, viewer]);
    return (
        <div>
            <h1>Friends Feed</h1>
            <h3>Friends List</h3>
            <Friends/>
            <h3>Friends Posts</h3>
            <Posts viewerId={viewer.viewerId} posts={friendPosts}/>
        </div>
    )
}

export default FriendFeed;
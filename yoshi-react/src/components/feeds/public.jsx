import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import React, { useEffect, useState } from "react";
import Notifications from './notifcation-box.jsx';
import CreatePost from '../posts/create.jsx';
import Posts from '../posts/posts.jsx';
import Following from './following.jsx';

function PublicFeed() {
    const navigate = useNavigate();
    const [publicPosts, setPublicPosts] = useState([]);
    const [viewer, setViewerId] = useState({
        viewerId: '',
    })

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
            setViewerId(prevViewer => ({...prevViewer, viewerId}))
        })
        .catch(err => { });

       console.log('Debug: Fetching all the public/following posts of this user');
       config = {
           method: 'post',
           maxBodyLength: Infinity,
           url: '/server/public/posts',
           headers: {
               'Content-Type': 'application/x-www-form-urlencoded'
           },
           data: {
               sessionId: localStorage.getItem('sessionId'),
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
    }, []);
    const LogOut = () => {
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
    }
    return (
        <div>
            <h1>Public Feed</h1>
            <button type="button" onClick={() => LogOut()}>Log Out</button>
            <CreatePost/>
            <Notifications/>
            <Following/>
            <h3>Public and Follower Posts</h3>
            <Posts viewerId={viewer.viewerId} posts={publicPosts}/>
        </div>
    )
}

export default PublicFeed;
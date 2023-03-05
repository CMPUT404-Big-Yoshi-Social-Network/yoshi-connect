import { useNavigate } from 'react-router-dom';
import TopNav from './topNav.jsx';
import LeftNavBar from './leftNav.jsx';
import RightNavBar from './rightNav.jsx';
import React, { useEffect, useState } from "react";
import axios from 'axios';
import Notifications from './notifcation-box.jsx';
import CreatePost from '../posts/create.jsx';
import Posts from '../posts/posts.jsx';
import Friends from './friends.jsx';
import './friend.css';

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
                    <h1>Friends Feed</h1>
                </div>
                <div className='pubColR'>
                    <RightNavBar/>
                </div>
            </div>
            <h3>Friends List</h3>
            <Friends/>
            <h3>Friends Posts</h3>
            <Posts viewerId={viewer.viewerId} posts={friendPosts}/>
        </div>
    )
}

export default FriendFeed;
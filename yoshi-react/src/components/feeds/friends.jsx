import axios from 'axios';
import React, { useEffect, useState } from "react";
import Friend from './single.jsx';
import Post from '../posts/post.jsx';

function Friends() {
    const [friends, setFriends] = useState([]);
    const [friendPosts, setFriendPosts] = useState([]);
    const checkExpiry = () => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: '/server/friends',
        }
        axios
        .get('/server/friends', config)
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
        console.log('Debug: Fetching all the friends for this author')
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/server/friends',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                sessionId: localStorage.getItem('sessionId'),
            }
        }
        axios
        .post('/server/friends', config)
        .then((response) => {
            setFriends(response.data.friends)
        })
        .catch(err => {
            console.error(err);
        });

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
    }, [setFriends, setFriendPosts]);
    return (
        <div>
            <h3>Friends</h3>
            {Object.keys(friends).map((friend, idx) => (
                <Friend key={idx} {...friends[friend]}/>
            ))}
            {Object.keys(friendPosts).map((friendPost, idx) => (
                <Post key={idx} {...friendPosts[friendPost]}/>
            ))}
        </div>
    )
}

export default Friends;
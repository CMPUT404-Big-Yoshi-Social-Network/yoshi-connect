import axios from 'axios';
import React, { useEffect, useState } from "react";
import Friend from './single.jsx';

function Friends() {
    const [friends, setFriends] = useState([]);
    const [friendPosts, setFriendPosts] = useState([]);
    useEffect(() => {
        console.log('Debug: Fetching all the friends for this user')
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

        console.log('Debug: Fetching all the friends post of this user');
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
            setFriendPosts(response.data.friendsPosts)
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
            {/* {Object.keys(friendPosts).map((friendPost, idx) => (
                <Post key={idx} {...friendPosts[friendPost]}/>
            ))} */}
        </div>
    )
}

export default Friends;
import axios from 'axios';
import React, { useEffect, useState } from "react";
import Friend from './single.jsx';

function Friends() {
    const [friends, setFriends] = useState([]);
    useEffect(() => {
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
    }, [setFriends]);
    return (
        <div>
            <h3>Friends</h3>
            {Object.keys(friends).map((friend, idx) => (
                <Friend key={idx} {...friends[friend]}/>
            ))}
        </div>
    )
}

export default Friends;
import { useNavigate, useParams } from 'react-router-dom';
import React, { useEffect } from "react";
import { useState } from 'react';
import axios from 'axios';
function Profile() {
    const { username } = useParams();
    const [friend, setFriend] = useState({
        friend: 'Add Friend'
    })
    const navigate = useNavigate();
    useEffect(() => {
        const isRealProfile = () => {
            axios
            .get('/server/users/' + username)
            .then((response) => {
                console.log('Debug: Profile Exists.')
                if (response.data.personal === true) {
                    setFriend({
                        ...friend,
                        friend: 'Unfriend'
                      })
                }
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
    }, [username, friend, navigate]);
    const ChangeFriendState = () => {
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
            navigate("/");
        })
        .catch(err => {
          console.error(err);
        });

    }
    return (
        <div>
            You are viewing profile. Welcome to {username}'s profile!
            <button type="button" onClick={() => ChangeFriendState()}>{ friend.friend }</button>
        </div> 
    )
}

export default Profile;
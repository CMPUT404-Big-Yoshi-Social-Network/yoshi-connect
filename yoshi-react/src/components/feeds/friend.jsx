import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import axios from 'axios';
import Friends from './friends.jsx';
import Posts from '../posts/posts.jsx';

function FriendFeed() {
    const navigate = useNavigate();
    const [friendPosts, setFriendPosts] = useState([]);

    useEffect(() => {
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
       checkExpiry();

       console.log('Debug: Fetching all the friends post of this author');
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

    }, [setFriendPosts, navigate]);
    return (
        <div>
            <h1>Friends Feed</h1>
            <h3>Friends List</h3>
            <Friends/>
            <h3>Friends Posts</h3>
            <Posts viewerId={viewerId} authorId={authorId} posts={friendPosts}/>
        </div>
    )
}

export default FriendFeed;
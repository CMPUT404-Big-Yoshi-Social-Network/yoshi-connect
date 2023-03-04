import axios from 'axios';
import React, { useEffect, useState } from "react";
import Follow from './follow.jsx';

function Following() {
    const [followings, setFollowing] = useState([]);

    useEffect(() => {
       console.log('Debug: Fetching all followings for this user')
       let config = {
           method: 'post',
           maxBodyLength: Infinity,
           url: '/server/following',
           headers: {
               'Content-Type': 'application/x-www-form-urlencoded'
           },
           data: {
               sessionId: localStorage.getItem('sessionId'),
           }
       }
       axios
       .post('/server/following', config)
       .then((response) => {
           setFollowing(response.data.following)
       })
       .catch(err => {
           console.error(err);
       });
    });
    return (
        <div>
            <h3>Following</h3>
            {Object.keys(followings).map((following, idx) => (
                <Follow key={idx} {...followings[following]}/>
            ))}
        </div>
    )
}

export default Following;
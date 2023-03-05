import axios from 'axios';
import React, { useEffect, useState } from "react";
import Follow from './follow.jsx';

function Following() {
    const [followings, setFollowings] = useState([]);

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
            setFollowings(response.data.following)
       })
       .catch(err => {
           console.error(err);
       });
    }, []);
    return (
        <div>
            <h3>Following</h3>
            {(followings.length === 0) ? null :
                <div>
                    {Object.keys(followings).map((following, idx) => (
                        <Follow key={idx} {...followings[following]}/>
                    ))}
                </div>
            }
        </div>
    )
}

export default Following;
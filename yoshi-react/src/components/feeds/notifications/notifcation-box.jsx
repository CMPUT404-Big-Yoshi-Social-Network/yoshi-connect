import React, { useEffect } from "react";
import Requests from './requests/requests.jsx';

function Notifications() {
    useEffect(() => {
     });
    return (
        <div>
            <h3>Notifications</h3>
            <div><Requests/></div>
            {/* Friend Requests: accepted notification
            Likes received from own posts from other users
            Comments received from own posts from other users */}
        </div>
    )
}

export default Notifications;
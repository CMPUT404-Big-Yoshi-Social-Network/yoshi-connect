import React, { useEffect } from "react";
import Requests from './requests.jsx';

function Notifications() {
    useEffect(() => {
     });
    return (
        <div>
            <h1>Notification Box</h1>
            <div><Requests/></div>
            {/* Friend Requests: accepted notification
            Likes received from own posts from other users
            Comments received from own posts from other users */}
        </div>
    )
}

export default Notifications;
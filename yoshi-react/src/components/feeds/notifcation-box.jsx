import React, { useEffect } from "react";
import Requests from './requests.jsx';

function Notifications() {
    useEffect(() => {
     });
    return (
        <div>
            <h1>Notification Box</h1>
            <div><Requests/></div>
            {/* Friend Requests: received one or accepted 
            Likes
            Comments */}
        </div>
    )
}

export default Notifications;
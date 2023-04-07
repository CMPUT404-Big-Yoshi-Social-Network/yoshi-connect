/*
Copyright 2023 Kezziah Camille Ayuno, Alinn Martinez, Tommy Sandanasamy, Allan Ma, Omar Niazie

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.


Furthermore it is derived from the Python documentation examples thus
some of the code is Copyright © 2001-2013 Python Software
Foundation; All Rights Reserved
*/

// Functionality
import React, { useEffect, useState } from "react";

// Child Component
import Requests from './requests/requests.jsx';
import axios from "axios";

function Notifications(props) {
    /**
     * Description: Represents a Notification
     * Functions: N/A
     * Returns: N/A
     */
    const [likes, setLikes] = useState([]);
    const [comments, setComments] = useState([]);
    useEffect(() => {
        axios
        .get('/authors/' + props.authorId + '/inbox/notifications')
        .then((response) => {
            setLikes(prevLikes => response.data.likes);
            setComments(prevComments => response.data.comments);
        })
        .catch(err => { });
    }, [props.authorId]);

    const clearInbox = (e) => {
        /**
           * Description:  
           * Request: (if axios is used)    
           * Returns: 
           */
        e.preventDefault()
  
        axios
        .delete('/authors/' + props.authorId + '/inbox')
        .then((response) => { })
        .catch(err => { });
      }
    return (
        <div className="notif-card">
            <h3>Notifications</h3>
            <hr/>
            <div><Requests authorId={props.authorId}/></div>
            <hr/>
            <h3>Likes</h3>
            {Object.keys(likes).map((like, idx) => (
                <p key={idx}>{like}</p>
            ))}
            <hr/>
            <h3>Comments</h3>
            {Object.keys(comments).map((comment, idx) => (
                <p key={idx}>{comment}</p>
            ))}
            <hr/>
            <h4 onClick={clearInbox} type="submit">clear</h4>
        </div>
    )
}

export default Notifications;
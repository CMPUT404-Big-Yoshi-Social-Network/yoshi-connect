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
import React from "react";
import axios from 'axios';

// Child Components
import EditComment from "./editComment";

// User Interface
import Popup from 'reactjs-popup';

function Comment(props) {
    /**
     * Description: Represents a Comment 
     * Functions: 
     *     - deleteComment(): Sends a DELETE request to delete a comment on a specific post 
     * Returns: N/A
     */
    const deleteComment = () => {
        /**
         * Description: Deletes a comment related to a post
         * Request: DELETE
         * Returns: N/A
         */
        console.log("Debug: Deleting comment");

        let config = {
            method: "delete",
            maxBodyLength: "Infinity",
            url: "/server/authors/" + props.authorId + "/posts/" + props.postId,
            headers: { 'Content-Type': 'application/json' },
            data: {
                commenter: props.commenter,
                commentId: props._id,
                authorId: props.authorId,
                postId: props.postId,
                status: "Remove comment"
            }
        };

        axios.delete("/server/authors/" + props.authorId + "/posts/" + props.postId, config).then((response) => {}).catch((error) => { console.log(error); });
    }

    return (
        <div id='comment'>
            <h4>{ props.commenter }</h4>
            { props.comment }
            { props.commenter !== props.viewerId ? null : 
                <Popup className='post-buttons' trigger={<button>Edit</button>}><EditComment {...props}/></Popup> }    
            { props.commenter !== props.viewerId ? null : 
                <button className='post-buttons' onClick={deleteComment}>Delete</button> }    
        </div>
    )
}

export default Comment;
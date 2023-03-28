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

function Comment({comment}) {
    /**
     * Description: Represents a Comment 
     * Functions: 
     *     - deleteComment(): Sends a DELETE request to delete a comment on a specific post 
     * Returns: N/A
     */
    console.log('Debug: <TLDR what the function is doing>')
    const deleteComment = () => {
        axios.delete('/authors/' + comment.authorId + '/posts/' + comment.postId + '/comments' + comment._id)
        .then((response) => { })
        .catch((err) => { });
    }

    return (
        <div id='comment'>
            <h4>{ comment !== undefined ? comment.author.displayName : null}</h4>
            { comment ? comment.comment : null }
            { comment && comment.commenter !== comment.viewerId ? null : 
                <Popup className='post-buttons' trigger={<button>Edit</button>}><EditComment {...comment}/></Popup> }    
            { comment && comment.commenter !== comment.viewerId ? null : 
                <button className='post-buttons' onClick={deleteComment}>Delete</button> }    
        </div>
    )
}

export default Comment;
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
import axios from 'axios';
import React, { useState, useEffect } from 'react';

function Comment({viewerId, comment, author}) {
    /**
     * Description: Represents a Comment 
     * Functions: 
     *     - deleteComment(): Sends a DELETE request to delete a comment on a specific post 
     * Returns: N/A
     */

    const [liked, setLiked] = useState(true);

    const likeComment = () => {
        let body = {
            type: "like",
            summary: "DisplayName likes your comment",
            author: author,
            object: comment.id
        }

        axios.post('/authors/' + encodeURIComponent(comment.author.id) + '/inbox', body)
        .then((response) => {

        })
        .catch((err) => { 
            
        });
    }

   useEffect(() => {

        axios.get(comment.id + '/likes')
        .then((response) => {
            console.log(response);
            let likes = response.data.likes;
            for(let i = 0; i < likes.length; i++){
                let like = likes[i];
                let likeAuthorId = like.author.id.split("/");
                likeAuthorId = likeAuthorId[likeAuthorId.length - 1];
                if(likeAuthorId === viewerId){
                    setLiked(true);
                    return
                }
            }
            setLiked(false);
            return
        })
        .catch((err) => {
            console.log(err);
        });
    },[comment.id, viewerId]);

    return (
        <div id='comment'>
            <h4>{ comment !== undefined ? comment.author.displayName : null}</h4>
            { comment ? comment.comment : null }
            { !liked ? <button className='post-buttons' >Already Liked</button> :
                <button className='post-buttons' onClick={likeComment}>Like</button> }
        </div>
    )
}

export default Comment;
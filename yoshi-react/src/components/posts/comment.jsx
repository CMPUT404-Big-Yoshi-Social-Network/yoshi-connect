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

function Comment({viewerId, comment, author, url, liked}) {
    /**
     * Description: Represents a Comment 
     * Functions: 
     *     - deleteComment(): Sends a DELETE request to delete a comment on a specific post 
     *     - likeComment(): Sends a POST request of the like to the Author's inbox on a specific comment
     *     - getLikes(): Fetches the likes related to the comment ID
     * Returns: N/A
     */
    console.log('Debug: Comment() <TLDR what the function is doing>')
    const [numLikes, setNumLikes] = useState(0);

    const [like, setLike] = useState(false);
    const commentSplit = comment.id.split("/")
    const commentId = commentSplit[commentSplit.length - 1] 

    const addLike = () => {
        if(author){
            let body = {
                type: "like",
                summary: author.displayName + " likes your comment",
                author: author,
                object: comment.id
            }

            axios.post('/authors/' + encodeURIComponent(comment.author.id) + '/inbox', body, {
                "X-Requested-With": "XMLHttpRequest"
            })
            .then((response) => {
                setLike(true);
                setNumLikes(numLikes + 1);
            })
            .catch((err) => { });
        }
    }

    useEffect(() => {
        function getLikes(){
            /**
             * Description: Fetches the likes of a specific comment through sending a GET request
             * Request: GET
             * Returns: N/A
             */
            axios.get(url + "/" + commentId + '/likes')
            .then((response) => {
                let likes = response.data.likes;
                if (likes.length !== undefined) {
                    setNumLikes(likes.length);
                }
                for(let i = 0; i < likes.length; i++){
                    let like = likes[i];
                    let likeAuthorId = like.author.url.split("/");
                    likeAuthorId = likeAuthorId[likeAuthorId.length - 1];
                    if(likeAuthorId === viewerId){
                        setLike(true);
                        return
                    }
                }
            })
            .catch((err) => {
            });
        }
        getLikes();
    },[commentId, viewerId, url, setNumLikes]);

    return (
        <div id='comment'>
            <h4>{ comment !== undefined ? comment.author.displayName : null}</h4>
            { comment ? comment.comment : null }
            { !like ? <span>{numLikes}<button className='post-buttons' onClick={addLike}>Like</button></span> : <span>{numLikes}<button className='post-buttons'>Unlike</button></span>} 
        </div>
    )
}

export default Comment;
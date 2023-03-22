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
import ReactCommonmark from "react-commonmark";
import axios from 'axios';
import React, { useState, useEffect } from 'react';

// Child Component 
import Comment from './comment';
import EditPost from "./edit";

// Styling
import './post.css';

// User Interface
import Popup from 'reactjs-popup';

function Post({viewerId, post}) {
    /**
     * Description: Represents a post 
     * Functions:
     *     - useEffect(): Checks if the current viewer of a post has already liked the post 
     *     - toggleComments(): Hides and Unhides the comment section
     *     - deletePost(): Deletes an author's post (only the post they own)
     *     - addLike(): Adds a like to a specific post by current viewer
     *     - removeLike(): Removes a like to a specific post by current viewer
     *     - makeComment(): Adds a comment to a specific post by current viewer
     * Returns: N/A
     */
    const postId = post._id;
    const authorId = post.authorId;
    const url = "/server/authors/" + viewerId + "/posts/" + postId;

    // TEMPORARY
    const [numLikes, setNumLikes] = useState(0);
    const numComments = 0;

    const [comment, setComment] = useState({ newComment: "" });
    const [showComment, setShowComment] = useState(false);
    const [like, setLike] = useState(false);
    const [item, setItem] = useState({ image: "" });

    useEffect(() => { 
        /**
         * Description: Before render, checks if the current viewer has already liked the post and changes the like button accordingly
         * Request: POST
         * Returns: N/A
         */
        console.log('Debug: Checking if the viewer has already liked the post')
        const getImage = () => {
            axios
            .get("/authors/" + authorId + "/posts/" + postId + "/image")
            .then((res) => {
                if (res.data.status === 200) {
                    console.log(res.data.src)
                    setItem({ ...item, image: res.data.src})
                }
            })
        }
        getImage();

        const hasLiked = () => {
            /**
             * Description: Sends a POST request to check if the viewerId has already liked the post (by cross-referencing the postId)
             * Request: POST
             * Returns: N/A
             */
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: '/authors/' + authorId + '/posts/' + postId + '/likes',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    viewerId: viewerId,
                    postId: postId,
                    authorId: authorId,
                }
            }
            axios
            .post('/authors/' + authorId + '/posts/' + postId + '/likes', config)
            .then((response) => {
                if (response.data.status === 'liked') { setLike(true); } else { setLike(false); }
            })
            .catch(err => { });
        }
        hasLiked();
    }, [authorId, postId, viewerId])

    const toggleComments = () => { 
        /**
         * Description: Toggles the viewability of comments on a post
         * Returns: N/A
         */
        setShowComment(!showComment); 
    }

    const deletePost = () => {
        /**
         * Description: Sends a POST request in order to delete a post by cross-referencing the postId and authorId
         * Request: DELETE
         * Returns: N/A
         */
        console.log("Debug: Deleting Post");

        let config = {
            method: "delete",
            maxBodyLength: "Infinity",
            url: '/authors/' + authorId + '/posts/' + postId,
            headers: { 'Content-Type': 'application/json' }
        };

        axios.delete('/authors/' + authorId + '/posts/' + postId, config).then((response) => {}).catch((error) => { console.log(error); });
    }

    const addLike = () => {
        /**
         * Description: Sends a PUT request to notify that the current post has been liked by the viewer  
         * Request: PUT
         * Returns: N/A
         */
        console.log("Debug: Adding Like");

        let config = {
            method: "put",
            maxBodyLength: "Infinity",
            url: url,
            headers: { 'Content-Type': 'application/json' },
            data: {
                liker: viewerId,
                authorId: authorId,
                postId: postId,
                status: "Add like"
            }
        };

        axios.put(url, config)
        .then((response) => { setNumLikes(response.data.numLikes); })
        .catch((error) => { console.log(error); });
        setLike(true);
    }

    const removeLike = () => {
        /**
         * Description: Sends a DELETE request to remove a like from a specific post  
         * Request: DELETE
         * Returns: N/A
         */
        console.log("Debug: Removing Like");

        let config = {
            method: "delete",
            maxBodyLength: "Infinity",
            url: url,
            headers: { 'Content-Type': 'application/json' },
            data: {
                likeId: viewerId,
                authorId: authorId,
                postId: postId,
                status: "Remove like"
            }
        };

        axios.delete(url, config)
        .then((response) => { setNumLikes(response.data.numLikes); })
        .catch((error) => { console.log(error); });
        setLike(false);
    }

    const makeComment = () => {
        /**
         * Description: Sends a PUT request to add a comment to a specific post 
         * Request: PUT
         * Returns: N/A
         */
        console.log("Debug: Making Comment");

        let config = {
            method: "put",
            maxBodyLength: "Infinity",
            url: url,
            headers: { 'Content-Type': 'application/json' },
            data: {
                commenter: viewerId,
                authorId: authorId,
                postId: postId,
                content: comment.newComment,
                status: "Add comment"
            } 
        };

        axios(config)
        .then((response) => { })
        .catch((error) => { console.log(error); });
    }
    
    return (
        <div className="post">
            {!post.unlisted &&
                <div>
                    { post.title === "" ? null : <h1>{post.title}</h1> }
                    { post.description === "" ? null : <h3>{ post.description }</h3> }
                    { post.contentType === "type/plain" ? <p>{ post.content }</p> : post.contentType === "type/markdown" ? <ReactCommonmark source={post.content}/> : null }
                    <img className={"image"} src={item.image} alt=""/>

                    <p>{post.published}</p>
                    <br></br>
                    { !like ? <span>{numLikes}<button className='post-buttons' onClick={addLike}>Like</button></span> : <span>{numLikes}<button className='post-buttons' onClick={removeLike}>Unlike</button></span>} 
                    <br></br>
                    {numComments}
                    { showComment ? <button className='post-buttons' onClick={toggleComments}>Close Comments</button> : <button className='post-buttons' onClick={toggleComments}>Open Comments</button> }

                    {showComment && 
                        <div>
                            <h3>Comments</h3>

                            <form >
                                <input type="text" id="newComment" name="newComment" onChange={(e) => {
                                    setComment({...comment, newComment: e.target.value})
                                }}/>
                                <button className='post-buttons' type='button' onClick={makeComment}>Add Comment</button>
                            </form>
                            {
                                Object.keys(post.comments).map((comment, idx) => (
                                <Comment key={idx} authorId={authorId} viewerId={viewerId} postId={postId} {...post.comments[comment]}/>
                                )
                            )}
                        </div>}
                        <br></br>
                    {
                        post.authorId !== viewerId ? null : <Popup trigger={<button className='post-buttons' >Edit</button>}><EditPost viewerId={viewerId} post={post}/></Popup>
                    }    
                    {
                        post.authorId !== viewerId ? null : <button className='post-buttons' onClick={deletePost}>Delete</button>
                    }    
                </div>}
        </div>
    )
}

export default Post;
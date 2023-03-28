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
import { useNavigate } from 'react-router-dom';

// Child Component 
import Comment from './comment';
import EditPost from "./edit";

// Styling
import './post.css';

// User Interface
import Popup from 'reactjs-popup';
import SharePost from "./sharePost";

function Post({viewerId, post}) {
    let postId = post.id ? post.id.split('/') : undefined;
    postId = postId ? postId[postId.length - 1] : undefined;
    let authorId = post.author ? post.author.authorId : undefined;

    const [numLikes, setNumLikes] = useState(post.likeCount);
    const [numComments, setNumComments] = useState(post.commentCount);

    const [comment, setComment] = useState({ newComment: "" });
    const [showComment, setShowComment] = useState(false);
    const [like, setLike] = useState(false);
    const [item, setItem] = useState("");
    const url = "/authors/" + authorId + "/posts/" + postId + "/image"

    const navigate = useNavigate();

    useEffect(() => {
        /**
         * Description:  
         * Request: (if axios is used)    
         * Returns: 
         */
        if (viewerId !== null) {
            console.log('Debug: <TLDR what the function is doing>') 
            const getImage = () => {
                axios
                .get(url)
                .then((res) => {
                    if (res.data.status === 200) {
                        setItem(res.data.src)
                    } else {
                        setItem('')
                    }
                })
            }
            getImage();
        }
    }, [url, viewerId])

    useEffect(() => {
        /**
         * Description: Before render, checks if the current viewer has already liked the post and changes the like button accordingly
         * Request: POST
         * Returns: N/A
         */
        console.log('Debug: <TLDR what the function is doing>')
        const hasLiked = () => {
            // axios
            // .get('/authors/' + authorId + '/posts/' + postId + '/liked')
            // .then((response) => { setLike(true) })
            // .catch(err => { setLike(false) });
            console.log('In construction')
        }
        hasLiked();
    }, [authorId, postId])

    const toggleComments = () => { setShowComment(!showComment); }

    const deletePost = () => {
        /**
         * Description:  
         * Request: (if axios is used)    
         * Returns: 
         */
        console.log('Debug: <TLDR what the function is doing>')
        axios.delete('/authors/' + authorId + '/posts/' + postId)
        .then((response) => { })
        .catch((err) => { 
            if (err.response.status === 401) {
                navigate('/unauthorized')
            } else if (err.response.status === 400) {
                navigate('/badrequest')
            } else if (err.response.status === 404) {
                navigate('/notfound')
            } else if (err.response.status === 500) {
                console.log('500 PAGE')
            }
         });
    }

    const addLike = () => {
        /**
         * Description:  
         * Request: (if axios is used)    
         * Returns: 
         */
        console.log('Debug: <TLDR what the function is doing>')
        axios.put('/authors/' + authorId + '/posts/' + postId + '/likes')
        .then((response) => { 
            setNumLikes(response.data.numLikes); 
            setLike(true);
        })
        .catch((err) => { 
            if (err.response.status === 401) {
                navigate('/unauthorized')
            } else if (err.response.status === 400) {
                navigate('/badrequest')
            } else if (err.response.status === 404) {
                navigate('/notfound')
            } else if (err.response.status === 500) {
                console.log('500 PAGE')
            }
         });
    }

    const removeLike = () => {
        /**
         * Description:  
         * Request: (if axios is used)    
         * Returns: 
         */
        console.log('Debug: <TLDR what the function is doing>')
        axios.delete('/authors/' + authorId + '/posts/' + postId + '/likes')
        .then((response) => { 
            setNumLikes(response.data.numLikes); 
            setLike(false);
        })
        .catch((err) => { 
            if (err.response.status === 401) {
                navigate('/unauthorized')
            } else if (err.response.status === 400) {
                navigate('/badrequest')
            } else if (err.response.status === 404) {
                navigate('/notfound')
            } else if (err.response.status === 500) {
                console.log('500 PAGE')
            }
        });
    }

    const makeComment = () => {
        /**
         * Description:  
         * Request: (if axios is used)    
         * Returns: 
         */
        console.log('Debug: <TLDR what the function is doing>')
        let body = { content: comment.newComment };

        axios.put('/authors/' + authorId + '/posts/' + postId + '/comments', body)
        .then((response) => { setNumComments(response.data.numComments); })
        .catch((err) => { 
            if (err.response.status === 401) {
                navigate('/unauthorized')
            } else if (err.response.status === 400) {
                navigate('/badrequest')
            } else if (err.response.status === 404) {
                navigate('/notfound')
            } else if (err.response.status === 500) {
                console.log('500 PAGE')
            }
         });
    }
    
    return (
        <div className="post">
            {!post.unlisted &&
                <div>
                    { post.title === "" ? null : <h1>{post.title}</h1> }
                    { post.description === "" ? null : <h3>{ post.description }</h3> }
                    { post.contentType === "text/plain" ? <p>{ post.content }</p> : post.contentType === "text/markdown" ? <ReactCommonmark source={post.content}/> : null }
                    <img className={"image"} src={item} alt=""/>

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
                    <Popup trigger={<button className='post-buttons' >Share</button>}><SharePost viewerId={viewerId} post={post}/></Popup> 
                </div>}
        </div>
    )
}

export default Post;
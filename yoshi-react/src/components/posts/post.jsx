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
import Comments from './comments';
import EditPost from "./edit";
import SharePost from "./sharePost";
// Styling
import './post.css';

// User Interface
import Popup from 'reactjs-popup';

function Post({viewerId, post, author}) {
    let postId = post.id ? post.id.split('/') : undefined;
    postId = postId ? postId[postId.length - 1] : undefined;
    let authorId = post.author ? post.author.id.split('/') : undefined;
    authorId = authorId ? authorId[authorId.length - 1] : undefined;
    let published = post.published.substring(0,10);

    const [numLikes, setNumLikes] = useState(post.likeCount);
    const [numComments, setNumComments] = useState(post.count);
    const [commentCreated, setCommentCreated] = useState(0);
    const [comment, setComment] = useState({ newComment: "" });
    const [showComment, setShowComment] = useState(false);
    const [like, setLike] = useState(false);
    const [image, setImage] = useState("");
    const [items, setItems] = useState(undefined);

    const navigate = useNavigate();

    /**
         * Description:  
         * Request: (if axios is used)    
         * Returns: 
         */
    
    useEffect(() => {
        console.log('Debug: <TLDR what the function is doing>') 
        const getImage = () => {
            axios
            .get("/authors/" + authorId + "/posts/" + postId + "/image")
            .then((res) => {
                if (res.data.status === 200) {
                    setImage(res.data.src)
                } else {
                    setImage('')
                }
            })
        }
        getImage();
    }, [authorId, postId])

    useEffect(() => {    
        getLikes();
    });
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
        if(author){
        let body = {
            type: "like",
            summary: "DisplayName likes your post",
            author: author,
            object: post.id
        }

        axios.post('/authors/' + post.author.id + '/inbox', body, {
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        })
        .then((response) => {
            setLike(true);
            setNumLikes(numLikes + 1);
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
        let body = {
            type: "comment",
            author: author,
            comment: comment.newComment,
            contentType: "text/plaintext",
        };

        axios.post('/authors/' + authorId + '/posts/' + postId + '/comments', body)
        .then((response) => {
            setNumComments(numComments + 1);
            setCommentCreated(commentCreated + 1);
        })
        .catch((err) => { 
            if (err.response.status === 401) {
                navigate('/unauthorized');
            } else if (err.response.status === 400) {
                navigate('/badrequest');
            } else if (err.response.status === 404) {
                navigate('/notfound');
            } else if (err.response.status === 500) {
                console.log('500 PAGE');
            }
         });
    }
    
    const getLikes = () => {

        axios.get(post.id + '/likes')
        .then((response) => { 
            setNumLikes(response.data.items.length);
            setItems(response.data.items);
            let itemsCopy = response.data.items;
            for(let i = 0; i < itemsCopy.length; i++){
                let like = itemsCopy[i];
                let likeAuthorId = like.author.id.split("/");
                likeAuthorId = likeAuthorId[likeAuthorId.length - 1];
                if(likeAuthorId === viewerId){
                    setLike(true);
                }
            }
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

    return (
        <div className="post">
            {!post.unlisted &&
                <div>
                    { post.title === "" ? null : <h1>{post.title}</h1> }
                    { post.description === "" ? null : <h3>{ post.description }</h3> }
                    { post.contentType === "text/plain" ? <p>{ post.content }</p> : post.contentType === "text/markdown" ? <ReactCommonmark source={post.content}/> : null }
                    { image === "" ? null : <a href={"/authors/" + authorId + "/posts/" + postId + "/image"} target="_blank" rel="noreferrer" ><img className={"image"} src={image} alt=""/></a>}

                    <p>{published}</p>
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
                           <Comments key={commentCreated} viewerId={viewerId} url={post.id + '/comments'} author={author}> </Comments>
                        </div>}
                        <br></br>
                    <div>
                    <Popup trigger={<button className='post-buttons' >Share</button>}><SharePost viewerId={viewerId} post={post}/></Popup>
                </div>
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
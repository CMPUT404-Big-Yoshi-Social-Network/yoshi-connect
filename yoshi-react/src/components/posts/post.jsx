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
import Comments from './comments.jsx';
import EditPost from "./edit.jsx";
import SharePost from "./sharePost.jsx";
// Styling
import './post.css';

// User Interface
import Popup from 'reactjs-popup';

function Post({viewerId, post, author, realAuthor}) {
    let postId = post.id ? 
        post.id.includes('/') ? (post.id.split('/'))[(post.id.split('/')).length - 1] : 
        post.id :
        post._id ? (post._id.split('/'))[(post._id.split('/')).length - 1] : 
        undefined;
    let authorId = post.author ? 
        post.author.id ? (post.author.id.split('/'))[(post.author.id.split('/')).length - 1] : 
        post.author.url ? (post.author.url.split('/'))[(post.author.url.split('/')).length - 1] : 
        undefined : 
        undefined;
    let h = post.source.split('/authors/')[0].split("/")[2] === "localhost:3000" ? post.source.split('/authors/')[0].split("/")[2] : post.source.split('/authors/')[0].split("/")[2].split(".")[0] === "www" ? post.source.split('/authors/')[0].split("/")[2].split(".")[1] + "." + post.source.split('/authors/')[0].split("/")[2].split(".")[2]: post.source.split('/authors/')[0].split("/")[2].split(".")[0];
    if (authorId === undefined) {
        authorId = author;
    }
    let published = post.published.substring(0,10);
    let contentType = post.contentType ? post.contentType : ""
    

    const [numLikes, setNumLikes] = useState(post.likeCount);
    const [numComments, setNumComments] = useState(post.count);
    const [commentCreated, setCommentCreated] = useState(0);
    const [comment, setComment] = useState({ newComment: "" });
    const [showComment, setShowComment] = useState(false);
    const [like, setLike] = useState(false);
    const [image, setImage] = useState("");
    // const [items, setItems] = useState(undefined);
    const navigate = useNavigate();
    
    useEffect(() => {
        /**
         * Description: Fetches the image associated with a specific post through a GET request
         * Request: GET    
         * Returns: N/A
         */
       const getImage = () => {
            if (contentType.split("/")[0] === "image") {
                if (post.source.split('/authors/')[0].split("/")[2].split(".")[0] === "www" ) {
                    setImage("data:" + contentType + "," + post.content)
                } else if (post.source.split('/authors/')[0].split("/")[2].split(".")[0] === "bigger-yoshi") {
                    setImage(post.content)
                }
            } else {
                axios
                .get( post.id + "/image")
                .then((res) => {
                    if (res.data.status === 200) {
                        setImage(res.data.src)
                    } else {
                        setImage('')
                    }
                })
            }
        }
        getImage();
    }, [post.id, contentType, post.content, post.source])

    useEffect(() => { 
        /**
         * Description: Fetches the likes associated with a specific post through a GET request
         * Request: GET    
         * Returns: N/A
         */ 
        const getLikes = () => {
            axios.get(post.id + '/likes')
            .then((response) => { 
                setNumLikes(response.data.items.length);
                // setItems(response.data.items);
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
            .catch((err) => { });
        }
        getLikes();
    }, [post.id, viewerId]);
    const toggleComments = () => { setShowComment(!showComment); }

    const deletePost = () => {
        /**
         * Description: Deletes a Post through a delete request 
         * Request: DELETE   
         * Returns: N/A
         */
        axios.delete(post.id)
        .then((response) => { })
        .catch((err) => {
            if(err.response){
                if (err.response.status === 401) {
                    navigate('/unauthorized')
                } else if (err.response.status === 400) {
                    navigate('/badrequest')
                } else if (err.response.status === 404) {
                    navigate('/notfound')
                } else if (err.response.status === 500) {
                    navigate('/servererror')
                }
            }
         });
    }

    const addLike = () => {
        /**
         * Description: Sends a like object to the Author's inbox through a POST request 
         * Request: POST   
         * Returns: N/A
         */
        if(author){
            let body = {
                type: "like",
                summary: author.displayName + " likes your post",
                author: author,
                object: post.id
            }
            let id = post.author.id.split("/");
			id = id[id.length - 1];
            axios.post('/authors/' + id + '/inbox', body, {
                "X-Requested-With": "XMLHttpRequest"
        })
        .then((response) => {
            setLike(true);
            setNumLikes(numLikes + 1);
        })
        .catch((err) => {
            if(err.response){ }});
        }
    }

    const makeComment = () => {
        /**
         * Description: Sends a Comment through a POST request
         * Request: POST    
         * Returns: N/A
         */
        let body = {
            type: "comment",
            author: realAuthor,
            comment: comment.newComment,
            contentType: "text/plaintext",
            object: post.id
        };

        axios.post('/authors/' + encodeURIComponent(post.author.id) + '/inbox', body, {
            "X-Requested-With": "XMLHttpRequest"
        })
        .then((response) => {
            setNumComments(numComments + 1);
            setCommentCreated(commentCreated + 1);
        })
        .catch((err) => { 
            if(err.response){
                if (err.response.status === 401) {
                    navigate('/unauthorized');
                } else if (err.response.status === 400) {
                    navigate('/badrequest');
                } else if (err.response.status === 404) {
                    navigate('/notfound');
                } else if (err.response.status === 500) {
                    navigate('/servererror')
                }
            }
        });
    }
    return (
        <div className="post">
            {!post.unlisted &&
                <div>
                    {<p className='post-host'>{h === "localhost:3000" ? 'yoshi-connect' : h}</p>}
                    { post.source !== post.origin ? <h4>Shared Post</h4> : null}
                    { post.title === "" ? null : <h1>{post.title}</h1> }
                    { post.description === "" ? null : <h3>{ post.description }</h3> }
                    { post.contentType === "text/plain" ? <p className="post-content">{ post.content }</p> : post.contentType === "text/markdown" ? <ReactCommonmark source={post.content}/> : null }
                    { image === "" ? null : <a href={image} target="_blank" rel="noreferrer" ><img className={"image"} src={image} alt=""/></a>}

                    <p className="post-published">{published}</p>
                    <p className="post-num-lc">{numLikes}</p>
                    { !like ? <button className='post-buttons' onClick={addLike}>Like</button> : <button className='post-buttons'>Liked</button>} 
                    <p className="post-num-lc">{numComments}</p>
                    { showComment ? <button className='post-buttons' onClick={toggleComments}>Close Comments</button> : <button className='post-buttons' onClick={toggleComments}>Open Comments</button> }
                    <Popup trigger={<button className='post-buttons' >Share</button>}><SharePost viewerId={viewerId} post={post}/></Popup>
                    {
                        post.author?.authorId !== undefined && post.author?.authorId === viewerId ? 
                        <Popup trigger={<button className='post-buttons' >Edit</button>}><EditPost viewerId={viewerId} post={post}/></Popup> :
                        null
                    }    
                    {
                        post.author?.authorId !== undefined || author.authorId !== undefined ? 
                        post.author?.authorId !== viewerId || author.authorId !== viewerId ? null : 
                        <button className='post-buttons' onClick={deletePost}>Delete</button> :
                        null
                    }    

                    {showComment && 
                        <div>
                            <h3>Comments</h3>

                            <form >
                                <input type="text" id="newComment" name="newComment" onChange={(e) => {
                                    setComment({...comment, newComment: e.target.value})
                                }}/>
                                <button className='post-buttons' type='button' onClick={makeComment}>Add Comment</button>
                            </form>
                           <Comments key={commentCreated} viewerId={viewerId} url={'/authors/' + authorId + '/posts/' + postId + '/comments'} author={author} liked={post} commentsSrc={post.commentsSrc}> </Comments>
                        </div>}
                    <div>
                </div>
                    
                </div>}
        </div>
    )
}

export default Post;
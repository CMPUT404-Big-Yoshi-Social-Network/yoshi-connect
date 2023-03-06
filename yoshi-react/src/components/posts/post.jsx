import React from "react";
import ReactCommonmark from "react-commonmark";
import axios from 'axios';
import Comment from './comment';
import { useState } from 'react';
import './post.css';
import EditPost from "./edit";
import { useEffect } from "react";
import Popup from 'reactjs-popup';

function Post({viewerId, post}) {
    const postId = post._id;
    const authorId = post.authorId;
    const url = "/server/authors/" + authorId + "/posts/" + postId;

    const [numLikes, setNumLikes] = useState(post.likes.length)
    const numComments = post.comments.length

    const [comment, setComment] = useState({
        newComment: ""
    })
    const [showComment, setShowComment] = useState(false)

    const [like, setLike] = useState(false)

    useEffect(() => { 
        console.log('Debug: Checking if the viewer has already liked the post')
        const hasLiked = () => {
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: '/server/posts/',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    viewerId: viewerId,
                    postId: postId,
                    authorId: authorId,
                    status: 'Checking if post is already liked'
                }
            }
            axios
            .post('/server/posts/', config)
            .then((response) => {
                if (response.data.status === 'liked') {
                    setLike(true);
                } else {
                    setLike(false);
                }
            })
            .catch(err => { });
        }
        hasLiked();
    }, [authorId, postId, viewerId])

    const toggleComments = () => { 
        console.log("Debug: Toggle Comments");
        setShowComment(!showComment);
    }

    const deletePost = () => {
        console.log("Debug: Deleting Post");
        let config = {
            method: "delete",
            maxBodyLength: "Infinity",
            url: url,
            headers: { 'Content-Type': 'application/json' },
            data: {
                authorId: authorId,
                postId: postId,
                status: "Remove post"
            }
        };
        axios.delete(url, config).then((response) => {}).catch((error) => { console.log(error); });
    }

    const addLike = () => {
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
        .then((response) => {
            setNumLikes(response.data.numLikes);
        })
        .catch((error) => { console.log(error); });
        setLike(true);
    }

    const removeLike = () => {
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
        .then((response) => {
            setNumLikes(response.data.numLikes);
            setLike(false);
        })
        .catch((error) => { console.log(error); });
    }

    const makeComment = () => {
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
        .then((response) => { 
        })
        .catch((error) => { console.log(error); });
    }
    
    return (
        <div className="post">
            {!post.unlisted &&
                <div>
                    { post.title === "" ? null : <h1>{post.title}</h1> }
                    { post.description === "" ? null : <h3>{ post.description }</h3> }
                    { post.contentType === "type/plain" ? <p>{ post.content }</p> : post.contentType === "type/markdown" ? <ReactCommonmark source={post.content}/> : null }
                    { post.image === ""? null : <a href={post.image} target="_blank"><img src={post.image} alt=""/></a> }

                    <p>{post.published}</p>
                    <br></br>
                    { !like ? <span>{numLikes}<button onClick={addLike}>Like</button></span> : <span>{numLikes}<button onClick={removeLike}>Unlike</button></span>} 
                    <br></br>
                    {numComments}
                    { showComment ? <button onClick={toggleComments}>Close Comments</button> : <button onClick={toggleComments}>Open Comments</button> }

                    {showComment && 
                        <div>
                            <h3>Comments</h3>

                            <form >
                                <input type="text" id="newComment" name="newComment" onChange={(e) => {
                                    setComment({...comment, newComment: e.target.value})
                                }}/>
                                <button onClick={makeComment}>Add Comment</button>
                            </form>

                            {
                                Object.keys(post.comments).map((comment, idx) => (
                                <Comment key={idx} authorId={authorId} viewerId={viewerId} postId={postId} {...post.comments[comment]}/>
                                )
                            )}
                        </div>}
                        <br></br>
                    {
                        post.authorId !== viewerId ? null : <Popup trigger={<button>Edit</button>}><EditPost viewerId={viewerId} post={post}/></Popup>
                    }    
                    {
                        post.authorId !== viewerId ? null : <button onClick={deletePost}>Delete</button>
                    }    
                </div>}
        </div>
    )
}

export default Post;
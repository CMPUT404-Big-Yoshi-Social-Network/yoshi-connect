import React from "react";
import ReactCommonmark from "react-commonmark";
import axios from 'axios';
import Comment from './comment';
import { useState } from 'react';

function Post({viewerId, post}) {
    const postId = post._id;
    const authorId = post.authorId;
    const url = "/server/authors/" + authorId + "/posts/" + postId;

    const [comment, setComment] = useState({
        newComment: ""
    })
    const [showComment, setShowComment] = useState(false)

    const [like, setLike] = useState({
        liked: false
    })

    const toggleComments = () => { 
        console.log("Debug: Toggle Comments");
        setShowComment(!showComment);
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
        axios.put(url, config).then((response) => {}).catch((error) => { console.log(error); });
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
        axios.delete(url, config).then((response) => {}).catch((error) => { console.log(error); });
        setLike(false);
    }

    const makeComment = () => {
        console.log("Debug: Making Comment");
        let config = {
            method: "put",
            maxBodyLength: "Infinity",
            url: url,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: {
                commenter: viewerId,
                authorId: authorId,
                postId: postId,
                content: comment.newComment,
                status: "Add comment"
            } 
        };
        axios(config).then((response) => {}).catch((error) => { console.log(error); });
    }
    
    return (
        <div style={{backgroundColor: "grey"}}>
            <hr size={"2px"} width={"fill"} color={"black"}/>
            {!post.unlisted &&
                <div>
                    { post.title === "" ? null : <h1>{post.title}</h1> }
                    { post.description === "" ? null : <h3>{ post.description }</h3> }
                    { post.contentType === "type/plain" ? <p>{ post.content }</p> : post.contentType === "type/markdown" ? <ReactCommonmark source={post.content}/> : null }

                    <p>{post.published}</p>

                    { !like ? <button onClick={removeLike}>Unlike</button> : <button onClick={addLike}>Like</button> } 

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

                            {Object.keys(post.comments).map((comment, idx) => (
                                <Comment key={idx} {...post.comments[comment]}/>
                            ))}
                        </div>}
                </div>}
        </div>
    )
}

export default Post;
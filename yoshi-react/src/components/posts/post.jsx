import React from "react";
import axios from 'axios';
import Comment from './comment';
import { useState } from 'react';

function Post(props) {
    const viewerId = props.viewerId;
    const postId = props._id;
    const authorId = props.authorId;
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
            {!props.unlisted &&
                <div>
                    {props.title === "" ? null : <h1>{props.title}</h1>}
                    {props.description === "" ? null : <h3>{props.description}</h3>}

                    <hr size={"2px"} width={"fill"} color={"white"}/>

                    {props.content === "" ? null : props.contentType === "type/plain" ? <p>{props.content}</p> : <p>Markdown:{props.content}</p>}

                    <p>{props.published}</p>

                    { like ? <button onClick={removeLike}>Unlike</button> : <button onClick={addLike}>Like</button>} 

                    {showComment ? <button onClick={toggleComments}>Close Comments</button> : <button onClick={toggleComments}>Open Comments</button>}

                    {showComment && 
                        <div>
                            <h3>Comments</h3>

                            <form >
                                <input type="text" id="newComment" name="newComment" onChange={(e) => {
                                    setComment({...comment, newComment: e.target.value})
                                }}/>
                                <button onClick={makeComment}>Add Comment</button>
                            </form>

                            {Object.keys(props.comments).map((comment, idx) => (
                                <Comment key={idx} {...props.comments[comment]}/>
                            ))}
                        </div>}
                </div>}
        </div>
    )
}

export default Post;
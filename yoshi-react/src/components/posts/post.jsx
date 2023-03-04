import React, { useEffect } from "react";
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
    const [like, setLike] = useState({
        liked: false
    })
    const [showComment, setShowComment] = useState(false)
    const [data, setData] = useState({
        title: props.title,
        desc: props.description,
        contentType: props.contentType,
        visibility: props.visibility,
        content: props.content,
        likes: props.likes,
        comments: props.comments,
        published: props.published,
        unlisted: props.unlisted,
        specifics: props.specifics,
        image: props.image
    });

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
            {!data.unlisted &&
                <div>
                    {data.title === "" ? null : <h1>{data.title}</h1>}
                    {data.desc === "" ? null : <h3>{data.desc}</h3>}

                    <hr size={"2px"} width={"fill"} color={"white"}/>

                    {data.content === "" ? null : data.contentType === "type/plain" ? <p>{data.content}</p> : <p>Markdown:{data.content}</p>}

                    <p>{data.published}</p>

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

                            {Object.keys(data.comments).map((comment, idx) => (
                                <Comment key={idx} {...data.comments[comment]}/>
                            ))}
                        </div>}
                </div>}
        </div>
    )
}

export default Post;
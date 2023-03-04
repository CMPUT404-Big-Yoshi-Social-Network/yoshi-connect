import React, { useEffect } from "react";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Comment from './comment';
import { useState } from 'react';

function Post(props) {
    const [comment, setComment] = useState({
        newComment: ""
    })
    const [isComment, setIsComment] = useState(false)
    const [data, setData] = useState({
        title: "",
        desc: "",
        contentType: "type/plain",
        visibility: "Public",
        content: "",
        likes: [],
        comments: [],
        published: "",
        listed: false,
        specifics: [],
        image: "",
        liked: false
    });

    const veiwerId = props.viewerId;
    const postId = props.postId;
    const authorId = props.authorId;

    useEffect(() => {
        axios.get("server/authors/" + authorId + "/posts/" + postId)
        .then((response) => {
            data.title = response.data[0].posts.title;
            data.desc = response.data[0].posts.description;
            data.contentType = response.data[0].posts.contentType;
            data.visibility = response.data[0].posts.visibility;
            data.content = response.data[0].posts.content;

            response.data[0].posts.likes.forEach = (likes) => {
                data.likes.push(likes);
                if (likes.likers === veiwerId) { data.liked = true; }
            };

            data.published = response.data[0].posts.published;
            data.listed = response.data[0].posts.unlisted;
        })
        .catch((error) => { console.log(error); });
    });

    const toggleComments = () => { 
        setIsComment(!isComment);
        console.log("Toggling Comments");
    }


    const addLike = () => {
        console.log("Adding Like");
        let config = {
            method: "put",
            maxBodyLength: "Infinity",
            url: "/server/authors/"+authorId+"/posts/"+postId,
            headers: { 'Content-Type': 'application/json' },
            data: {
                liker: veiwerId,
                authorId: authorId,
                postId: postId,
                status: "Add like"
            }
        };
        axios.put("/server/authors/"+authorId+"/posts/"+postId, config).then((response) => {}).catch((error) => { console.log(error); });
        data.liked = true;
    }
    const removeLike = () => {
        console.log("Removing Like");
        let config = {
            method: "delete",
            maxBodyLength: "Infinity",
            url: "/server/authors/"+authorId+"/posts/"+postId,
            headers: { 'Content-Type': 'application/json' },
            data: {
                likeId: veiwerId,
                authorId: authorId,
                postId: postId,
                status: "Remove like"
            }
        };
        axios.delete("/server/authors/"+authorId+"/posts/"+postId, config).then((response) => {}).catch((error) => { console.log(error); });
        data.liked = false;
    }

    const makeComment = () => {
        console.log("Making Comment");
        let config = {
            method: "put",
            maxBodyLength: "Infinity",
            url: "/server/authors/"+authorId+"/posts/"+postId,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: {
                commenter: veiwerId,
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
            {data.listed &&
                <div>
                    {data.title === "" ? null : <h1>{data.title}</h1>}
                    {data.desc === "" ? null : <h3>{data.desc}</h3>}
                    <button>IDK</button>
                    <button>Share</button>
                    <button>More</button>
                    <hr size={"2px"} width={"fill"} color={"white"}/>
                    {data.content === ""? null : data.contentType === "type/plain"? 
                    <p>{data.content}</p> : <p>Markdown:{data.content}</p>}
                    <p>{data.published}</p>
                    {data.liked ? <button onClick={removeLike}>Unlike</button> : <button onClick={addLike}>Like</button>} 
                    {isComment ? <button onClick={toggleComments}>Close Comments</button> : <button onClick={toggleComments}>Open Comments</button>}
                    {isComment && 
                        <div>
                            <h3>Comments</h3>
                            <form >
                                <input type="text" id="newComment" name="newComment" onChange={(e) => {
                                    setComment({...comment, content: e.target.value})
                                }}/>
                                <button onClick={makeComment}>Add Comment</button>
                            </form>
                            {Object.keys(data.comments).map((comment) => (
                                <Comment {...data.comments[comment]}/>
                            ))}
                        </div>}
                </div>}
        </div>
    )
}

export default Post;
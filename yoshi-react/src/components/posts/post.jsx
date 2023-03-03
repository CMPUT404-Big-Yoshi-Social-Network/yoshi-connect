import React from "react";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Comment from './comment';
import { useState } from 'react';

function Post() {
    // const { veiwerId } = props;
    const veiwerId = "15d84277-d4ec-42b3-8e75-1278cd5654c2"
    const postId = "300c32ac-cebc-42f6-b3dd-2fb6f481f61c"
    const authorId = "15d84277-d4ec-42b3-8e75-1278cd5654c2"

    // const { authorId, postId } = useParams();
    const [data, setData] = useState({
        title: "WORK",
        desc: "PLS",
        contentType: "type/plain",
        visibility: "Public",
        content: "HMMMMMMM",
        likes: [],
        comments: [],
        published: "2023-03-03T04:17:17.002Z",
        unlisted: true,
        image: "blob:http://localhost:3000/bb46b4b4-6b8d-4908-b255-789121c6621b"
    })
    let config = {
        method: "get",
        maxBodyLength: "Infinity",
        url: "/server/authors/" + authorId + "/" + postId,
        headers: {
            "Content-Type": "application/json"
        }
    }

    // axios.get("/server/authors/" + authorId + "/" + postId)
    // .then((response) => {
    //     data.title = response.data.title;
    //     data.desc = response.data.desc;
    //     data.contentType = response.data.contentType;
    //     data.visibility = response.data.visibility;
    //     data.content = response.data.content;
    //     data.likes = response.data.likes;
    //     data.comments = response.data.comments;
    //     data.published = response.data.published;
    //     data.unlisted = response.data.unlisted;
    //     data.image = response.data.image;
    // })
    // .catch((error) => { console.log(error); });
    const listed = data.unlisted;

    const blobToImage = (blob) => {
        const imageUrl = URL.createObjectURL(blob);
        const img = document.querySelector('img');
        img.addEventListener("load", () => URL.revokeObjectURL(imageUrl));
        document.querySelector("img").src = imageUrl;
    }

    const [isComment, setIsComment] = useState(false)
    
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
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: {
                liker: veiwerId,
                authorId: authorId,
                postId: postId,
                status: "Add like"
            }
        };
        axios(config).then((response) => {}).catch((error) => { console.log(error); });
    }

    const removeLike = () => {
        console.log("Removing Like");
        let config = {
            method: "delete",
            maxBodyLength: "Infinity",
            url: "/server/authors/"+authorId+"/posts/"+postId,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: {
                likeId: veiwerId,
                authorId: authorId,
                postId: postId,
                status: "Remove like"
            }
        };
        axios(config).then((response) => {}).catch((error) => { console.log(error); });
    }
    const [comment, setComment] = useState({
        newComment: ""
    })

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
        <div>
            PLS WORK
        {listed &&
            <div>
                {data.title === "" ? null : <h1>{data.title}</h1>}
                <button>IDK</button>
                <button>Share</button>
                <button>More</button>
                <hr size={"2px"} width={"fill"} color={"white"}/>
                {data.desc === ""? null : data.contentType === "type/plain"? 
                    <p>BRUH{data.contentType}</p> : <p>Markdown:{data.contentType}</p>}
                {data.image === ""? null : <img id={"image"} src={blobToImage(data.image)} alt={data.title}/>}
                <p>{data.published}</p>
                {data.likes.includes(veiwerId) ? <button onClick={removeLike}>Unlike Post</button> : <button onClick={addLike}>Like Post</button>} 
                
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
                        {/* {Object.keys(data.comments).map((comment, idx) => (
                            <Comment key={idx} {...data.comments[comment]}/>
                        ))} */}
                    </div>}
            </div>}
        </div>
    )
}

export default  Post;
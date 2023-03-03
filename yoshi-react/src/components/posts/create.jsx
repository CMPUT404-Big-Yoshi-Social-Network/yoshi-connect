import React from "react";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import React, { useEffect, useState } from "react";
import Comment from './comment';
import { useState } from 'react';
function CreatePost() {
    // const { veiwerId } = props;
    const veiwerId = "15d84277-d4ec-42b3-8e75-1278cd5654c2"
    const postId = "300c32ac-cebc-42f6-b3dd-2fb6f481f61c"
    const authorId = "15d84277-d4ec-42b3-8e75-1278cd5654c2"

    // const { authorId, postId } = useParams();
    const navigate = useNavigate();
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
        image: "blob:http://localhost:3000/bb46b4b4-6b8d-4908-b255-789121c6621b",
        authorId: '',
        postId: ''
    })
    let config = {
        method: "get",
        maxBodyLength: "Infinity",
        url: "/server/authors/" + authorId + "/" + postId,
        headers: {
            "Content-Type": "application/json"
        }
    }
    const checkExpiry = () => { }
    useEffect(() => {
       checkExpiry();
       let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/server/posts/',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                sessionId: localStorage.getItem('sessionId'),
                status: 'Fetching current authorId'
            }
        }
        axios
        .post('/server/posts/', config)
        .then((response) => {
            let authorId = response.data.authorId;
            setData(prevAuthorId => ({...prevAuthorId, authorId}))
        })
        .catch(err => { });
    }, []);
    const post_post = () => {
        console.log('Debug: Creating a post!')
        togglePostMenu()

        axios.get("/server/authors/" + authorId + "/" + postId)
        .then((response) => {
            data.title = response.data.title;
            data.desc = response.data.desc;
            data.contentType = response.data.contentType;
            data.visibility = response.data.visibility;
            data.content = response.data.content;
            data.likes = response.data.likes;
            data.comments = response.data.comments;
            data.published = response.data.published;
            data.unlisted = response.data.unlisted;
            data.image = response.data.image;
        })
        .catch((error) => { console.log(error); });
        const listed = data.unlisted;
    }

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
            //     method: "put",
            //     maxBodyLength: "Infinity",
            //     url: "/server/authors/"+authorId+"/posts/"+postId,
            //     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            //     data: {
            //         liker: veiwerId,
            //         authorId: authorId,
            //         postId: postId,
            //         status: "Add like"
            //     }
            // };
            // axios(config).then((response) => {}).catch((error) => { console.log(error); });
            method: 'put',
            maxBodyLength: Infinity,
            url: '/server/authors/' + data.authorId + '/posts/',
            headers: {
            'Content-Type': 'multipart/form-data'
            },
            data: {
                title: data.title,
                desc: data.desc,
                contentType: data.contentType,
                visibility: data.visibility,
                content: data.content,
                likes: data.likes,
                comments: data.comments,
                unlisted: data.unlisted,
                image: data.image
            }
        }
        
        console.log(config)
        axios.put('/server/authors/' + data.authorId + '/posts/', config)
        .then((response) => {
            if ( response.data.status === 'Successful' ) {
                console.log("Debug: Token received.");
                console.log("Debug: Going to public feed.");
                navigate('/feed');
            }
        })
        .catch((e) =>{
            console.log(e);
    })}

    const post_image = () => {
        let formData = new FormData();
        let imageFile = document.querySelector('#image');
        formData.append("image", imageFile.files[0]);

        axios.put('/server/authors/posts/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
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

// export default  Post;
//             <button className={"createPostButton"} type={"button"} value={"Create Post"} onClick={togglePostMenu}>CREATE NEW POST</button>
//             {isOpen &&    
//                 <div className={"postMenuPage"}>
//                     <div className={"postMenuBox"}>
//                     <button className={"postMenuCloseButton"} onClick={togglePostMenu}>x</button>
//                     <h1 className={"createPostHeader"}>Create New Post</h1>
//                     <hr size={"2px"} width={"fill"} color={"white"}/>
//                     <form encType='multipart/form-data'>
//                         <label><p style={{color:"white"}}>Content Type</p></label>
//                         <label><p style={{color:"white"}}>Visibility</p></label>
//                         <label><p style={{color:"white"}}>Listed</p></label>
//                         <select className={"postMenuDropDown"} id={"contentType"} name={"contentType"}onChange={(e) => {
//                             setData({...data, contentType: e.target.value})}}>
//                             <option value={"plaintext"}>PLAIN TEXT</option>
//                             <option value={"markdown"}>MARKDOWN</option>
//                         </select>

//                         <select className={"postMenuDropDown"} id={"visibility"} name={"visibility"} onChange={(e) => {
//                             setData({...data, visibility: e.target.value})}}>
//                             <option value={"Public"}>PUBLIC</option>
//                             <option value={"Friends Only"}>FRIENDS</option>
//                         </select>

//                         <select className={"postMenuDropDown"} id={"unlisted"} name={"unlisted"} onChange={(e) =>{
//                             let bool;
//                             if(e.target.value === "True") bool = true;
//                             else if(e.target.value === "False") bool = false;
//                             setData({...data, unlisted: bool})
//                         }} >
//                             <option value="True">False</option>
//                             <option value="False">True</option>
//                         </select>


//                         <label><p style={{color:"white"}}>Title</p></label>
//                         <input className={"postMenuInput"} type="text" onChange={(e) => {
//                             setData({...data, title: e.target.value})
//                         }}></input>

//                         <label><p style={{color:"white"}}>Description</p></label>
//                         <input className={"postMenuInput"} type="text" onChange={(e) => {
//                             setData({...data, desc: e.target.value})
//                         }}></input>


//                         <label><p style={{color:"white"}}>Content</p></label>
//                         <textarea className={"postMenuInput"} id={"description"} name={"description"} rows={"8"}
//                                     wrap="physical" maxLength={"150"} onChange={(e) =>{
//                             setData({...data, content: e.target.value})
//                         }}/>
//                         <div style={{color:"white", textAlign:"right"}}>
//                             0/150 (doesn't actually count)
//                         </div>
                        
//                         <div className={"postMenuInput"}>
//                         {/* <input type={"file"} accept={"image/*"} multiple = "false" className={"postMenuImageInput"} name={"image"} id={"image"} onChange={previewFile}/> */}
//                         <input type={"file"} accept={"image/*"} multiple={false} className={"postMenuImageInput"} name={"image"} id={"image"} onChange={previewFile}/>
//                         <br/>
//                         <img src="" style={{maxHeight: "15vh"}} alt="" />
//                         </div>

//                         <div style={{color:"white", textAlign:"right"}}>
//                             25MB (not enforced)
//                         </div>

//                         <button className={"createPostButton"} type={"button"} onClick={post_post}>Create Post</button>
//                     </form>
//                 </div>
//             </div>
//             }   
//         </div>        
//     )
// }

export default CreatePost;

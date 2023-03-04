import axios from 'axios';
import React, { useEffect, useState } from "react";
import Post from "./post.jsx";

function CreatePost() {
    const [data, setData] = useState({
        title: "",
        desc: "",
        contentType: "type/plain",
        visibility: "Public",
        content: "",
        likes: [],
        comments: [],
        unlisted: false,
        image: "",
        authorId: '',
        specifics: [],
        postId: ''
    })
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
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
    
    const savePost = () => {
        console.log('Debug: Creating a post')
        togglePostMenu();

        let config = {
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
                specifics: data.specifics,
                image: data.image
            }
        }
        
        axios.put('/server/authors/' + data.authorId + '/posts/', config)
        .then((response) => { })
        .catch((e) =>{ console.log(e); })
    }

    const togglePostMenu = () => {
        setIsOpen(!isOpen);
        console.log("Toggling post menu");
    }

    function previewImage() {
        const preview = document.querySelector("img");
        const file = document.querySelector("input[type=file]").files[0];
        const reader = new FileReader();
        const reader2 = new FileReader();

        reader2.onload = function (event) {
            var blob = new Blob([event.target.result]); 
            window.URL = window.URL || window.webkitURL;
            var blobURL = window.URL.createObjectURL(blob); 
            data.image = blobURL;
        }
    
        reader.addEventListener(
          "load",
          () => { preview.src = reader.result; },
          false
        );
      
        if (file) {
          reader.readAsDataURL(file);
          reader2.readAsArrayBuffer(file);
        }
    }

    return (
        <div>
            <button className={"createPostButton"} type={"button"} value={"Create Post"} onClick={togglePostMenu}>CREATE NEW POST</button>
            <br/>
            <Post/>
            <br/>
            {isOpen &&    
                <div className={"postMenuPage"}>
                    <div className={"postMenuBox"}>
                    <button className={"postMenuCloseButton"} onClick={togglePostMenu}>x</button>
                    <h1 className={"createPostHeader"}>Create New Post</h1>
                    <hr size={"2px"} width={"fill"} color={"white"}/>
                    <form encType='multipart/form-data'>
                        <label><p style={{color:"white"}}>Content Type</p></label>
                        <label><p style={{color:"white"}}>Visibility</p></label>
                        <label><p style={{color:"white"}}>Listed</p></label>
                        <select className={"postMenuDropDown"} id={"contentType"} name={"contentType"}onChange={(e) => {
                            setData({...data, contentType: e.target.value})}}>
                            <option value={"plaintext"}>PLAIN TEXT</option>
                            <option value={"markdown"}>MARKDOWN</option>
                        </select>

                        <select className={"postMenuDropDown"} id={"visibility"} name={"visibility"} onChange={(e) => {
                            setData({...data, visibility: e.target.value})}}>
                            <option value={"Public"}>Public</option>
                            <option value={"Friends"}>Friends</option>
                            <option value={"Private"}>Private</option>
                        </select>

                        <select className={"postMenuDropDown"} id={"unlisted"} name={"unlisted"} onChange={(e) =>{
                            let bool;
                            if(e.target.value === "True") bool = true;
                            else if(e.target.value === "False") bool = false;
                            setData({...data, unlisted: bool})
                        }} >
                            <option value="True">False</option>
                            <option value="False">True</option>
                        </select>

                        <label><p style={{color:"white"}}>Message To:</p></label>
                        <input className={"postMenuInput"} type="text" onChange={(e) => {
                            setData({...data, specifics: [e.target.value]})
                        }}></input>

                        <label><p style={{color:"white"}}>Title</p></label>
                        <input className={"postMenuInput"} type="text" onChange={(e) => {
                            setData({...data, title: e.target.value})
                        }}></input>

                        <label><p style={{color:"white"}}>Description</p></label>
                        <input className={"postMenuInput"} type="text" onChange={(e) => {
                            setData({...data, desc: e.target.value})
                        }}></input>


                        <label><p style={{color:"white"}}>Content</p></label>
                        <textarea className={"postMenuInput"} id={"description"} name={"description"} rows={"8"}
                                    wrap="physical" maxLength={"150"} onChange={(e) =>{
                            setData({...data, content: e.target.value})
                        }}/>
                        <div style={{color:"white", textAlign:"right"}}>
                            0/150 (doesn't actually count)
                        </div>
                        
                        <div className={"postMenuInput"}>
                        <input type={"file"} accept={"image/*"} multiple={false} className={"postMenuImageInput"} name={"image"} id={"image"} onChange={previewImage}/>
                        <br/>
                        <img src="" style={{maxHeight: "15vh"}} alt="" />
                        </div>

                        <div style={{color:"white", textAlign:"right"}}>
                            25MB (not enforced)
                        </div>

                        <button className={"createPostButton"} type={"button"} onClick={savePost}>Create Post</button>
                    </form>
                </div>
            </div>
            }   
        </div>        
    )
}

export default CreatePost;
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
import axios from 'axios';
import React, { useEffect, useState } from "react";
import FileBase64 from 'react-file-base64';

// User Interface
import { Nav } from 'react-bootstrap';

// Styling
import './create.css';

function CreatePost() {
    /**
     * Description: Represents the CreatePost Form 
     * Functions: 
     *     - useEffect: Fetches the authorId related to the post 
     *     - savePost: Saves a post into the database 
     *     - togglePostMenu: Hides and Unhides the Post Menu
     *     - uploadImage: Uploades an image into the database related to a post
     * Returns: N/A
     */
    console.log('Debug: <TLDR what the function is doing>')
    const [data, setData] = useState({
        title: "",
        description: "",
        contentType: "text/plain",
        visibility: "PUBLIC",
        content: "",
        likes: [],
        comments: [],
        unlisted: false,
        image: '',
        authorId: '',
        postTo: '',
        postId: ''
    })
    const [isOpen, setIsOpen] = useState(false);

    const [item, setItem] = useState({ 
        type: "",
        image: "",
        size: 0,
     });

    useEffect(() => {
        /**
         * Description: Fetches the current authorId through sending a POST request
         * Request: POST
         * Returns: N/A
         */
        console.log('Debug: <TLDR what the function is doing>')
        const getId = () => {
            axios
            .get('/userinfo/')
            .then((response) => {
                let authorId = response.data.authorId;
                setData(prevAuthorId => ({...prevAuthorId, authorId}))
            })
            .catch(err => { 
                if (err.response.status === 404) { 
                 let authorId = ''
                 setData(prevAuthorId => ({...prevAuthorId, authorId}))
                } 
            });
        }
        getId();
    }, []);
    
    const savePost = async () => {
        /**
         * Description: Saves a newly created post by sending a PUT request with accompanying data representing the post
         * Request: PUT
         * Returns: N/A
         */
        console.log('Debug: Creating a post')

        togglePostMenu();

        let body = {
            title: data.title,
            description: data.description,
            contentType: data.contentType,
            visibility: data.visibility,
            content: data.content,
            likes: data.likes,
            comments: data.comments,
            unlisted: data.unlisted,
            postTo: data.postTo,
            image: data.image
        }

        let link = { postId: "" }
        
        await axios.post('/authors/' + data.authorId + '/posts/', body)
        .then((response) => { 
            if (response.status === 200) {
                link.postId = response.data.id.split('/')[6];
            }
        })
        .catch((e) =>{ console.log(e); })

        if (item.image !== "") {
            axios.put('/authors/' + data.authorId + '/posts/' + link.postId + "/image", {
                method: 'put',
                maxBodyLength: Infinity,
                url: '/authors/' + data.authorId + '/posts/' + link.postId + "/image",
                headers: { 'Content-Type': 'multipart/form-data' },
                image: item.image
            }).then((res) => {}).catch((e) => { console.log(e); })  
        }
        setItem({ ...item, image: "" })
    }

    const togglePostMenu = () => { 
        /**
         * Description: Toggles the Post Menu by changing the isOpen useState
         * Returns: N/A
         */
        console.log('Debug: <TLDR what the function is doing>')
        setIsOpen(!isOpen); 
        setItem({ ...item, image: "" })
    }

    return (
        <>
            <Nav.Link className='rn-post' type={"button"} value={"Create Post"} onClick={togglePostMenu}>Create Post</Nav.Link>
            {isOpen &&    
                <div className={"postMenuPage"}>
                    <div className={"postMenuBox"}>
                    <button className={"postMenuCloseButton"} onClick={togglePostMenu}>x</button>
                    <h1 className={"createPostHeader"}>Create New Post</h1>
                    <hr size={"2px"} width={"fill"} color={"white"}/>
                    <form encType='multipart/form-data'>
                        <label><p style={{color:"white"}}>Content Type</p></label>
                        <label><p style={{color:"white"}}>Visibility</p></label>
                        <label><p style={{color:"white"}}>Unlisted</p></label>
                        <select className={"postMenuDropDown"} id={"contentType"} name={"contentType"}onChange={(e) => {
                            setData({...data, contentType: e.target.value})}}>
                            <option value={"text/plain"}>PLAIN TEXT</option>
                            <option value={"text/markdown"}>MARKDOWN</option>
                        </select>

                        <select className={"postMenuDropDown"} id={"visibility"} name={"visibility"} onChange={(e) => {
                            setData({...data, visibility: e.target.value})}}>
                            <option value={"PUBLIC"}>Public</option>
                            <option value={"FRIENDS"}>Friends</option>
                            <option value={"Private"}>Private</option>
                        </select>

                        <select className={"postMenuDropDown"} id={"unlisted"} name={"unlisted"} onChange={(e) =>{
                            let bool;
                            if(e.target.value === "True") bool = true;
                            else if(e.target.value === "False") bool = false;
                            setData({...data, unlisted: bool})
                        }} >
                            <option value="False">False</option>
                            <option value="True">True</option>
                        </select>

                        <label><p style={{color:"white"}}>Message To:</p></label>
                        <input className={"postMenuInput"} type="text" onChange={(e) => {
                            setData({...data, postTo: e.target.value})
                        }}></input>

                        <label><p style={{color:"white"}}>Title</p></label>
                        <input className={"postMenuInput"} type="text" onChange={(e) => {
                            setData({...data, title: e.target.value})
                        }}></input>

                        <label><p style={{color:"white"}}>Description</p></label>
                        <input className={"postMenuInput"} type="text" onChange={(e) => {
                            setData({...data, description: e.target.value})
                        }}></input>


                        <label><p style={{color:"white"}}>Content</p></label>
                        <textarea className={"postMenuInput"} id={"description"} name={"description"} rows={"8"}
                                    wrap="physical" maxLength={"150"} onChange={(e) => {
                            setData({...data, content: e.target.value})
                        }}/>
                        <div style={{color:"white", textAlign:"right"}}>
                            0/150 (doesn't actually count)
                        </div>
                        
                        <div className={"postMenuInput"}>
                        <FileBase64
                                className={"postMenuImageInput"} name={"image"} id={"image"}
                                type="file"
                                multiple={false}
                                onDone={({ base64, size, type }) => setItem({ ...item, image: base64, size: size, type: type })}
                            />
                        <br/>
                        <img src={item.image} style={{maxHeight: "15vh"}} alt="" />
                        </div>

                        <div style={{color:"white", textAlign:"right"}}>
                            {item.size} of 10MB
                        </div>

                        <button className={"createPostButton"} type={"button"} onClick={savePost}>Create Post</button>
                    </form>
                </div>
            </div>
            }   
        </>        
    )
}

export default CreatePost;
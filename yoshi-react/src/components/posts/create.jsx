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

//Reference for tagging: https://www.youtube.com/watch?v=l8Jd7Ub4yJE&ab_channel=AngleBrace
function CreatePost() {
    /**
     * Description: Represents the CreatePost Form 
     * Functions: 
     *     - saveCategory(): Saves the post category
     *     - removeCategory(): Removes/filters the post category  
     *     - useEffect: Fetches the Author's info related to the authorId
     *     - savePost(): Saves a newly created post with the accompanying data in the database
     *     - togglePostMenu(): Toggles the Post Menu
     * Returns: N/A
     */
    console.log('Debug: Creating post form')

    const [categories, setCategories] = useState([])

    function saveCategory(e) {
        /**
         * Description: Saves the post category
         * Returns: N/A
         */
        if (e.key !== 'Enter') {
            return
        } 
        const category = e.target.value;
        if (!category.trim()) {
            return
        }
        setCategories([...categories, category]);
        e.target.value = '';
    }

    function removeCategory(idx) {
        /**
         * Description: Removes/filters the post category
         * Returns: N/A
         */
        setCategories(categories.filter((category,i) => i !== idx))
    }

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
         * Description: Fetches the Author's info associated with authorId through sending a GET request
         * Request: GET
         * Returns: N/A
         */
        console.log("Debug: Getting the Author's info")

        const getId = () => {
            axios
            .get('/userinfo/')
            .then((response) => {
                if (response.data !== null) { 
                    let authorId = response.data.authorId;
                    setData(prevAuthorId => ({...prevAuthorId, authorId}))
                }
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
         * Description: Saves a newly created post by sending a PUT request with accompanying data 
         * representing the post through sending a PUT request
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
            categories: categories,
            postTo: data.postTo,
            image: data.image,
            type: '',
            authorId: data.authorId
        }

        let link = { postId: "" }
        
        if (data.postTo === '') {
            await axios.post('/authors/' + data.authorId + '/posts/', body)
            .then((response) => { 
                if (response.status === 200) {
                    link.postId = response.data.id.split('/')[6];
                }
            })
            .catch((e) =>{ console.log(e); })
        } else {
            body.type = 'post'
            axios
            .get('/authors/' + data.authorId + '/postTo/' + body.postTo)
            .then((response) => {
                body.postTo = response.data;
                let postToId = response.data._id || (response.data.id.split('/authors/'))[(response.data.id.split('/authors/')).length - 1];
                axios.post('/authors/' + postToId + '/inbox', body)
                .then((response) => { 
                    if (response.status === 200) {
                        link.postId = response.data.id.split('/')[6];
                    }
                })
                .catch((e) =>{ console.log(e); })
            })
            .catch(err => { });
        }

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
        console.log('Debug: Toggling Post Menu')
        setCategories([])
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
                        <label className='postLabel'><p style={{color:"white"}}>Content Type:</p></label>
                        <select className={"postMenuDropDown"} id={"contentType"} name={"contentType"}onChange={(e) => {
                            setData({...data, contentType: e.target.value})}}>
                            <option value={"text/plain"}>Plain Text</option>
                            <option value={"text/markdown"}>Markdown</option>
                            <option value={"application/base64"}>Base64</option>
                            <option value={"image/png;base64"}>PNG</option>
                            <option value={"image/jpeg;base64"}>JPEG</option>
                        </select>
                        <label className='postLabel'><p style={{color:"white"}}>Visibility:</p></label>
                        <select className={"postMenuDropDown"} id={"visibility"} name={"visibility"} onChange={(e) => {
                            setData({...data, visibility: e.target.value})}}>
                            <option value={"PUBLIC"}>Public</option>
                            <option value={"FRIENDS"}>Friends</option>
                            <option value={"PRIVATE"}>Private</option>
                        </select>
                        <label className='postLabel'><p style={{color:"white"}}>Unlisted:</p></label>
                        <select className={"postMenuDropDown"} id={"unlisted"} name={"unlisted"} onChange={(e) =>{
                            let bool;
                            if(e.target.value === "True") bool = true;
                            else if(e.target.value === "False") bool = false;
                            setData({...data, unlisted: bool})
                        }} >
                            <option value="False">False</option>
                            <option value="True">True</option>
                        </select>

                        <input onKeyDown={saveCategory} type='text' placeholder='Enter a category' className='category-input'></input>

                        <p className='category-p'>Categories:</p>
                        { categories.map((category, idx) => (
                            <div className='category-list' key={idx}>
                                <span>{category}</span>
                                <span className='category-close' onClick={() => removeCategory(idx)}>x</span>
                            </div> 
                        ))}

                        { data.visibility === 'PRIVATE' ? 
                            <div>
                                <label><p style={{color:"white"}}>Message To:</p></label>
                                <input className={"postMenuInput"} type="text" onChange={(e) => {
                                    setData({...data, postTo: e.target.value})
                                }}></input>
                            </div> :
                            null
                        }

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
                                    wrap="physical" maxLength={"1000"} onChange={(e) => {
                            setData({...data, content: e.target.value})
                        }}/>
                        <div style={{color:"white", textAlign:"right"}}>
                            <p></p>
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
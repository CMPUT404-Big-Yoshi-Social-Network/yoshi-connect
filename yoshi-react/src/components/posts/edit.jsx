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
import React, { useState, useEffect } from "react";
import FileBase64 from 'react-file-base64';

// Styling
import './create.css';

function EditPost({viewerId, post}) {
    /**
     * Description: Represents the updated post 
     * Functions: 
     *     - saveCategory(): Saves the post category
     *     - removeCategory(): Removes/filters the post category  
     *     - useEffect: Fetches the author ID and post ID to check if the viwer already liked the post
     *     - modifyPost(): Updates the post's contents
     * Returns: N/A
     */
    console.log('Debug: Editing post')

    const [categories, setCategories] = useState(post.categories)

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

    const [item, setItem] = useState({ 
        type: "",
        base64: "",
        size: 0,
        exist: false
     });

    useEffect(() => { 
        /**
         * Description: Checks if the viwer already liked the post 
         * Request: GET    
         * Returns: N/A
         */
        const getImage = () => {
            if (post.contentType.split("/")[0] === "image") {
                let postId = (post.id.split('/posts/'))[(post.id.split('/posts/')).length - 1]
                axios
                .get("/authors/" + post.author.authorId + "/posts/" + postId + "/image")
                .then((res) => {
                    if (res.data.status === 200) {
                        setItem({ ...item, image: res.data.src, exist: true})
                    }
                })
            // legacy code
            } else {
                let postId = (post.id.split('/posts/'))[(post.id.split('/posts/')).length - 1]
                axios
                .get("/authors/" + post.author.authorId + "/posts/" + postId + "/image")
                .then((res) => {
                    if (res.data.status === 200) {
                        setItem({ ...item, image: res.data.src, exist: true})
                    }
                })
            }
        }
        getImage();
    }, [post.author.authorId, post.id, item, post.contentType])

    
    const [data, setData] = useState({
        title: post.title,
        desc: post.description,
        contentType: post.contentType,
        visibility: post.visibility,
        content: post.content,
        unlisted: post.unlisted,
        image: post.image,
        postTo: '',
        postId: post._id
    })
    
    const modifyPost = (e) => {
        /**
         * Description: Handles the content update of that post through a POST request
         * Request: POST    
         * Returns: N/A
         */
        console.log('Debug: Modifying post')

        e.preventDefault()
        
        let body = {
            title: data.title,
            description: data.desc,
            contentType: data.contentType,
            visibility: data.visibility,
            content: data.content,
            unlisted: data.unlisted,
            categories: categories,
            image: data.image,
            postTo: data.postTo,
            postId: data.postId,
            id: post.id
        }
        
        let postId = (post.id.split('/posts/'))[(post.id.split('/posts/')).length - 1]
        axios.post('/authors/' + post.author.authorId + '/posts/' + postId, body)
        .then((response) => { })
        .catch((e) =>{ })

        if (item.exist) {
            axios.post('/authors/' + post.author.authorId + '/posts/' + postId + "/image", {
                method: 'post',
                maxBodyLength: Infinity,
                url: '/authors/' + post.author.authorId + '/posts/' + postId + "/image",
                headers: { 'Content-Type': 'multipart/form-data' },
                image: item.image
            }).then((res) => {}).catch((e) => {console.log(e);})
        } else {
            axios.put('/authors/' + post.author.authorId + '/posts/' + postId + "/image", {
                method: 'post',
                maxBodyLength: Infinity,
                url: '/authors/' + post.author.authorId + '/posts/' + postId + "/image",
                headers: { 'Content-Type': 'multipart/form-data' },
                image: item.image
            }).then((res) => {}).catch((e) => {console.log(e);})
        }

        
    }

    return (
        post.author.authorId !== viewerId ? null :
            <div className='editBackground'>
            <form>
                <label>
                    Title:
                    <input type="text" name="title" value={data.title || ''} onChange={(e) => {
                        setData({
                        ...data,
                        title: e.target.value
                        })
                    }}/>
                </label>
                <br/>
                <label>
                    Description:
                    <input type="text" name="description" value={data.desc || ''} onChange={(e) => {
                        setData({
                        ...data,
                        desc: e.target.value
                        })
                    }}/>
                </label>
                <br/>
                <select className={"postMenuDropDown"} id={"contentType"} name={"contentType"} value={data.contentType || "plaintext"} onChange={(e) => {
                            setData({...data, contentType: e.target.value})}}>
                            <option value={"text/plain"}>Plain Text</option>
                            <option value={"text/markdown"}>Markdown</option>
                            <option value={"application/base64"}>Base64</option>
                            <option value={"image/png;base64"}>PNG</option>
                            <option value={"image/jpeg;base64"}>JPEG</option>
                </select>
                <br/>
                <label>
                    Content:
                    <input type="text" name="content" value={data.content || ''} onChange={(e) => {
                        setData({
                        ...data,
                        content: e.target.value
                        })
                    }}/>
                </label>
                <br/>
                { data.visibility === 'PRIVATE' ? 
                    <div>
                        <label><p style={{color:"white"}}>Message To:</p></label>
                        <input className={"postMenuInput"} type="text" onChange={(e) => {
                            setData({...data, postTo: e.target.value})
                        }}></input>
                    </div> :
                    null
                }
                { data.visibility === 'PUBLIC' ? 
                    <div>
                        <select className={"postMenuDropDown"} id={"unlisted"} name={"unlisted"} value={data.unlisted || 'False'} onChange={(e) =>{
                                let bool;
                                if(e.target.value === "True") bool = true;
                                else if(e.target.value === "False") bool = false;
                                setData({...data, unlisted: bool})
                            }} >
                                <option value="False">False</option>
                                <option value="True">True</option>
                        </select>
                        <br/>        
                    </div> :
                    null

                }
                <select className={"postMenuDropDown"} id={"visibility"} name={"visibility"} value={data.visibility || 'Public '} onChange={(e) => {
                            setData({...data, visibility: e.target.value})}}>
                            <option value={"PUBLIC"}>Public</option>
                            <option value={"FRIENDS"}>Friends</option>
                            <option value={"PRIVATE"}>Private</option>
                </select>
                <br/>
                <div className={"postMenuInput"}>
                        <FileBase64
                                className={"postMenuImageInput"} name={"image"} id={"image"}
                                type="image"
                                multiple={false}
                                onDone={({ base64, size, type }) => setItem({ ...item, image: base64, size: size, type: type })}
                            />
                        <br/>
                        <img src={item.image} style={{maxHeight: "15vh"}} alt="" />
                </div>
                <div style={{color:"white", textAlign:"right"}}>
                    {item.size} of 10MB
                </div>

                <p>Categories</p>
                <div>
                    { categories.map((category, idx) => (
                        <div key={idx}>
                            <span className='category'>{category}</span>
                            <span className='close' onClick={() => removeCategory(idx)}>x</span>
                        </div> 
                    ))}
                    <input onKeyDown={saveCategory} type='text' placeholder='Enter a category' className='category-input'></input>
                </div>

                <button className='post-buttons' type="submit" onClick={modifyPost}>Edit Post</button>
            </form>
        </div>
    )
}

export default EditPost;
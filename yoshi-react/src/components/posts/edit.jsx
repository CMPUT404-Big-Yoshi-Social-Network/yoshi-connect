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
    const [categories, setCategories] = useState(post.categories)

    function saveCategory(e) {
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
        setCategories(categories.filter((category,i) => i !== idx))
    }

    const [item, setItem] = useState({ 
        type: "",
        base64: "",
        size: 0,
        exist: false
     });

    useEffect(() => { 
        console.log('Debug: Checking if the viewer has already liked the post')
        const getImage = () => {
            axios
            .get("/authors/" + post.authorId + "/posts/" + post._id + "/image")
            .then((res) => {
                if (res.data.status === 200) {
                    setItem({ ...item, image: res.data.src, exist: true})
                }
            })
        }
        getImage();
    }, [post, item])

    /**
     * Description: Sends a POST request to get the post content and handles the content update of that post 
     * Request: POST    
     * Returns: N/A
     */
    console.log('Debug: <TLDR what the function is doing>')
    const [data, setData] = useState({
        title: post.title,
        desc: post.description,
        contentType: post.contentType,
        visibility: post.visibility,
        content: post.content,
        unlisted: post.unlisted,
        image: post.image,
        specifics: post.specifics,
        postId: post._id
    })
    
    const modifyPost = (e) => {
        /**
         * Description: Sends a POST request of the updated post conetents 
         * Request: POST    
         * Returns: N/A
         */
        console.log('Debug: <TLDR what the function is doing>')
        e.preventDefault()
        
        let body = {
            title: data.title,
            desc: data.desc,
            contentType: data.contentType,
            visibility: data.visibility,
            content: data.content,
            unlisted: data.unlisted,
            specifics: data.specifics,
            categories: categories,
            image: data.image,
            postId: data.postId,
        }
        
        axios.post('/authors/' + post.authorId + '/posts/' + post._id, body)
        .then((response) => { })
        .catch((e) =>{ console.log(e); })

        if (item.exist) {
            axios.post('/authors/' + post.authorId + '/posts/' + post._id + "/image", {
                method: 'post',
                maxBodyLength: Infinity,
                url: '/authors/' + post.authorId + '/posts/' + post._id + "/image",
                headers: { 'Content-Type': 'multipart/form-data' },
                image: item.image
            }).then((res) => {}).catch((e) => {console.log(e);})
        } else {
            axios.put('/authors/' + post.authorId + '/posts/' + post._id + "/image", {
                method: 'post',
                maxBodyLength: Infinity,
                url: '/authors/' + post.authorId + '/posts/' + post._id + "/image",
                headers: { 'Content-Type': 'multipart/form-data' },
                image: item.image
            }).then((res) => {}).catch((e) => {console.log(e);})
        }

        
    }

    return (
        post.authorId !== viewerId ? null :
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
                            <option value={"plaintext"}>PLAIN TEXT</option>
                            <option value={"markdown"}>MARKDOWN</option>
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
                <label><p style={{color:"white"}}>Message To:</p></label>
                        <input className={"postMenuInput"} type="text" value={data.specifics || ''} onChange={(e) => {
                            setData({...data, specifics: [e.target.value]})
                        }}></input>
                <br/>
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
                <select className={"postMenuDropDown"} id={"visibility"} name={"visibility"} value={data.visibility || 'Public '} onChange={(e) => {
                            setData({...data, visibility: e.target.value})}}>
                            <option value={"Public"}>Public</option>
                            <option value={"Friends"}>Friends</option>
                            <option value={"Private"}>Private</option>
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
                            <span class='category'>{category}</span>
                            <span class='close' onClick={() => removeCategory(idx)}>x</span>
                        </div> 
                    ))}
                    <input onKeyDown={saveCategory} type='text' placeholder='Enter a category' class='category-input'></input>
                </div>

                <button className='post-buttons' type="submit" onClick={modifyPost}>Edit Post</button>
            </form>
        </div>
    )
}

export default EditPost;
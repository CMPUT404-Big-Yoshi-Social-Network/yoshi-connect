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
import React, { useState } from "react";

// Styling
import './create.css';

function EditPost({viewerId, post}) {
    /**
     * Description: Sends a POST request to get the post content and handles the content update of that post 
     * Request: POST    
     * Returns: N/A
     */
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
    
    const modifyPost = () => {
        /**
         * Description: Sends a POST request of the updated post conetents 
         * Request: POST    
         * Returns: N/A
         */
        console.log('Debug: Creating a post')
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/server/authors/' + post.authorId + '/posts/' + data.postId,
            headers: {
            'Content-Type': 'multipart/form-data'
            },
            data: {
                title: data.title,
                desc: data.desc,
                contentType: data.contentType,
                visibility: data.visibility,
                content: data.content,
                unlisted: data.unlisted,
                specifics: data.specifics,
                image: data.image,
                postId: data.postId,
                status: 'Modify'
            }
        }
        
        axios.post('/server/authors/' + post.authorId + '/posts/' + data.postId, config)
        .then((response) => { })
        .catch((e) =>{ console.log(e); })
    }

    async function uploadImage() {
        /**
         * Description: Sends a GET request to get the retrieve the image date and handles the content upload 
         * Request: GET    
         * Returns: N/A
         */
        // Cloudinary Version
        const data2 = new FormData();
        const preview = document.querySelector("img");
        const file = document.querySelector("input[type=file]").files[0];
        data2.append("file", file);
        data2.append("upload_preset", "biumvy2g");
      
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/di9yhzyxv/image/upload`,
          {
            method: "POST",
            body: data2,
          }
        );
        const img = await res.json();
        data.image = img.secure_url;
        preview.src = img.secure_url;
        
    }

    return (
        post.authorId !== viewerId ? null :
            <div className='editBackground'>
            <form method='PUT'>
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
                        <input type={"file"} accept={"image/*"} multiple={false} className={"postMenuImageInput"} name={"image"} id={"image"} onChange={uploadImage}/>
                        <br/>
                        <img src="" style={{maxHeight: "15vh"}} alt="" />
                </div>
                <button className='post-buttons' type="submit" onClick={modifyPost}>Edit Author</button>
            </form>
        </div>
    )
}

export default EditPost;
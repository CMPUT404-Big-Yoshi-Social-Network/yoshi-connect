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

// Styling
import axios from 'axios';
import { useEffect, useState } from 'react';
import ReactCommonmark from 'react-commonmark';
import './create.css';


function SharePost({viewerId, post}) {
    let postId = post.id ? post.id.split('/') : undefined;
    postId = postId ? postId[postId.length - 1] : undefined;
    let authorId = post.author ? post.author.authorId : undefined;
    console.log(post)

    const [item, setItem] = useState("");
    const numLikes = post.likeCount;
    const numComments = post.commentCount;

    const url = "/authors/" + authorId + "/posts/" + postId + "/image"

    const [data, setData] = useState({
        visibility: post.visibility,
        unlisted: post.unlisted,
        specifics: post.specifics,
        postId: post._id
    })

    useEffect(() => {
        /**
         * Description:  
         * Request: (if axios is used)    
         * Returns: 
         */
        if (viewerId !== null) {
            console.log('Debug: <TLDR what the function is doing>') 
            const getImage = () => {
                axios
                .get(url)
                .then((res) => {
                    if (res.data.status === 200) {
                        setItem(res.data.src)
                    } else {
                        setItem('')
                    }
                })
            }
            getImage();
        }
    }, [url, viewerId])

    const share = async () => {
        /**
         * Description:  
         * Request: (if axios is used)    
         * Returns: 
         */
        console.log('Debug: <TLDR what the function is doing>')
        let body = {
            title: post.title,
            description: post.description,
            contentType: post.contentType,
            visibility: data.visibility,
            content: post.content,
            likes: post.likes,
            comments: post.comments,
            unlisted: data.unlisted,
            postTo: data.postTo,
            image: post.image,
            postId: post._id,
            source: post.source,
            origin: post.origin,
            id: post.id,
            author: post.author
        }
        
        await axios.post('/authors/' + viewerId + '/posts/' + postId + '/share', body)
        .then((response) => { })
        .catch((e) =>{ console.log(e); })
    }

    return (
        <div className="post">
            { post.title === "" ? null : <h1>{post.title}</h1> }
            { post.description === "" ? null : <h3>{ post.description }</h3> }
            { post.contentType === "text/plain" ? <p>{ post.content }</p> : post.contentType === "text/markdown" ? <ReactCommonmark source={post.content}/> : null }
            <img className={"image"} src={item} alt=""/>

            <p>{post.published}</p>
            <br></br>
            {<span>{numLikes}<p>Like</p></span>} 
            <br></br>
            {<span>{numComments}<p>Comments</p></span>} 
            <br></br> 

            <label><p style={{color:"white"}}>Message To:</p></label>
                    <input className={"postMenuInput"} type="text" value={data.specifics || ''} onChange={(e) => {
                        setData({...data, specifics: [e.target.value]})
                    }}></input>
            <br/>
            <span>Unlisted</span>
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
            <button className='post-buttons' onClick={share}>Share</button>   
        </div>
    )
}

export default SharePost;
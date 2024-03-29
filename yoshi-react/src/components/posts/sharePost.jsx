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
import { useNavigate } from 'react-router-dom';


function SharePost({viewerId, post}) {
    /**
     * Description: Represents the paginated Posts
     * Functions: 
     *     - useEffect(): Fetches the Post's image
     *     - share(): Shares the Post 
     * Returns: N/A
     */
    const navigate = useNavigate();
    let postId = post.id ? 
        post.id.includes('/') ? (post.id.split('/'))[(post.id.split('/')).length - 1] : 
        post.id :
        post._id ? (post._id.split('/'))[(post._id.split('/')).length - 1] : 
        undefined;
    let authorId = post.author ? 
        post.author.id ? (post.author.id.split('/'))[(post.author.id.split('/')).length - 1] : 
        post.author.url ? (post.author.url.split('/'))[(post.author.url.split('/')).length - 1] : 
        undefined : 
        undefined;
    let contentType = post.contentType ? post.contentType : ""
    let published = post.published.substring(0,10);

    const [data, setData] = useState({
        visibility: post.visibility,
        unlisted: post.unlisted,
        postTo: '',
        postId: post._id
    })

    const [item, setItem] = useState({ 
        type: "",
        base64: "",
        size: 0,
        exist: false
     });

    useEffect(() => { 
        /**
         * Description: Fetches the Post's image through a GET request
         * Request: GET    
         * Returns: N/A
         */
        console.log('Debug: Checking if the viewer has already liked the post')
        const getImage = () => {
            if (contentType.split("/")[0] === "image") {
                if (post.origin.split('/authors/')[0].split("/")[2].split(".")[0] === "www" ) {
                    setItem(i => ({ ...i, image: "data:" + contentType + "," + post.content, exist: true}))
                } else if (post.origin.split('/authors/')[0].split("/")[2].split(".")[0] === "bigger-yoshi") {
                    setItem(i => ({ ...i, image: post.content, exist: true}))
                } else if (post.origin.split('/authors/')[0].split("/")[2].split(".")[0] === "yoshi-connect" || post.origin.split('/authors/')[0].split("/")[2] === "localhost:3000") {
                    axios
                    .get("/author" + post.origin.split("author")[1] + "/image")
                    .then((res) => {
                        if (res.data.status === 200) {
                            setItem(i => ({ ...i, image: res.data.src, exist: true}))
                        }
                    })
                    .catch((e) => { console.log(e); })
                }
            }
        }
        getImage();
    }, [postId, authorId, post.content, post.origin, contentType])

    const share = async () => {
        /**
         * Description: Shares the Post through a POST request
         * Request: POST    
         * Returns: 
         */
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
            postId: postId,
            source: post.source,
            origin: post.origin,
            id: post.id,
            author: post.author,
            authorId: authorId,
            status: 'share'
        }

        let link = { postId: "" }
        
        await axios.post('/authors/' + viewerId + '/posts/' + postId, body)
        .then((response) => { 
            if (response.status === 200) {
                link.postId = response.data.id.split('/')[6];
            }
        })
        .catch((e) =>{ console.log(e); })

        if (item.image !== "") {
            axios.put('/authors/' + viewerId + '/posts/' + link.postId + "/image", {
                method: 'put',
                maxBodyLength: Infinity,
                url: '/authors/' + viewerId + '/posts/' + link.postId + "/image",
                headers: { 'Content-Type': 'multipart/form-data' },
                image: item.image
            }).then((res) => {}).catch((e) => { console.log(e); })  
        }
        setItem({ ...item, image: "" })
        navigate(window.location.pathname);
    }

    return (
        <div className="share-post">
            { post.title === "" ? null : <h1>{post.title}</h1> }
            { post.description === "" ? null : <h3>{ post.description }</h3> }
            { post.contentType === "text/plain" ? <p>{ post.content }</p> : post.contentType === "text/markdown" ? <ReactCommonmark source={post.content}/> : null }
            <img className={"image"} src={item.image} alt=""/>

            <p>{published}</p>

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
            <button className='post-buttons' onClick={share}>Share</button>   
        </div>
    )
}

export default SharePost;
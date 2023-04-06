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
import React from "react";
import { useState, useEffect } from 'react';
import axios from 'axios';

import Post from './post.jsx';
import TopNav from "../feeds/navs/top/nav";
import LeftNavBar from "../feeds/navs/left/nav";
import RightNavBar from "../feeds/navs/right/nav";

function SinglePost() { 
    /**
     * Description: Represents a single Post
     * Functions: 
     *     - useEffect(): 
     *          - Fetches the user info from a specific Post
     *          - Fetches the Post through a GET request
     * Returns: N/A
     */
    const [post, setPost] = useState(null);
    const [viewerId, setViewerId] = useState("");

    useEffect(() => {
        /**
         * Description: Fetches the user info from a specific Post through a GET request
         * Request: GET    
         * Returns: N/A
         */
        const getId = () => {

            axios
            .get('/userinfo/')
            .then((response) => {
                if (response.data !== null) { 
                    let viewerId = response.data.authorId;
                    setViewerId(viewerId);
                }
            })
            .catch(err => { 
                console.log(err)
            });
        }
        getId();

        let url = window.location.href.split('/authors')[1];

        axios
        .get('/authors' + url)
        .then((response) => {
            let post = response.data;
            setPost(prevPost => post);
        })
        .catch(err => { });
    }, []);
    return (
        <div>
            <div>
            <TopNav authorId={viewerId}/>
            <div className='pubRow'>
                <div className='pubColL'>
                    <LeftNavBar authorId={viewerId}/>
                </div>
                <div className='pubColM'>
                    { post === null ?
                        null :
                        <Post viewerId={viewerId} post={post} author={viewerId} realAuthor={post?.author}/> 
                    }
                </div>
                <div className='pubColR'>
                    <RightNavBar/>
                </div>
            </div>

        </div>
        </div>
    )
}

export default SinglePost;
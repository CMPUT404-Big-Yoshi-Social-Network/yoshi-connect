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
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Post from './post.jsx';
import TopNav from "../feeds/navs/top/nav";
import LeftNavBar from "../feeds/navs/left/nav";
import RightNavBar from "../feeds/navs/right/nav";

function SinglePost() { 
    const [post, setPost] = useState([]);
    const [viewerId, setViewerId] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const getId = () => {

            axios
            .get('/userinfo/')
            .then((response) => {
                let viewerId = response.data.authorId;
                setViewerId(viewerId);
            })
            .catch(err => { 
                console.log(err)
            });
        }
        getId();
    }, []);

    useEffect(() => {
        let url = window.location.href.split("/");
        let authorId = url[url.length - 3];
        let postId = url[url.length - 1];

        axios
        .get('/authors/' + authorId + '/posts/' + postId)
        .then((response) => {
            setPost(response.data);
        })
        .catch(err => {
            if (err.response.status === 404) {
                navigate('/notfound');
            } else if (err.response.status === 401) {
                navigate('/unauthorized');
            } else if (err.response.status === 500) {
                navigate('/servererror/');
            }
        });
    }, [navigate, setPost]);

    return (
        <div>
            <div>
            <TopNav authorId={viewerId}/>
            <div className='pubRow'>
                <div className='pubColL'>
                    <LeftNavBar authorId={viewerId}/>
                </div>
                <div className='pubColM'>
                    <Post viewerId={viewerId} post={post}/>  
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
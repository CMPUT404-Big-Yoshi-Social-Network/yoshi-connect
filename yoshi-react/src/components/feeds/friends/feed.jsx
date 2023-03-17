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
import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// User Interface
import TopNav from '../navs/top/nav.jsx';
import LeftNavBar from '../navs/left/nav.jsx';
import RightNavBar from '../navs/right/nav.jsx';

// Child Component
import Posts from '../../posts/posts.jsx';

// Styling
import './feed.css';

function FriendFeed() {
    const [viewer, setViewerId] = useState({ viewerId: '' })
    const navigate = useNavigate();

    useEffect(() => {
        const getId = () => {
            axios
            .get('/api/userinfo/')
            .then((response) => {
                let viewerId = response.data.authorId;
                setViewerId({ viewerId: viewerId })
            })
            .catch(err => { if (err.response.status === 404) { 
                setViewerId('')
            } 
            });
        }
        getId();
    }, [viewer, navigate]);

    return (
        <div>
            <TopNav authorId={viewer.viewerId}/>
            <div className='pubRow'>
                <div className='pubColL'>
                    <LeftNavBar authorId={viewer.viewerId}/>
                </div>
                <div className='pubColM'>
                    <Posts type={'friends-posts'}/>  
                </div>
                <div className='pubColR'>
                    <RightNavBar/>
                </div>
            </div>

        </div>
    )
}

export default FriendFeed;
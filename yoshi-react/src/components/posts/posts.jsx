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
import Pagination from 'react-bootstrap/Pagination';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Child Component
import Post from './post.jsx';

function Posts({url, userInfo}) { 
    /**
     * Description:  
     * Request: (if axios is used)    
     * Returns: 
     */
    console.log('Debug: <TLDR what the function is doing>')
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [seeMore, setSeeMore] = useState(false);
    const size = 20;
    const navigate = useNavigate();

    useEffect(() => {
        /**
         * Description:  
         * Request: (if axios is used)    
         * Returns: 
         */
        if (url) {
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: url,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                params: {
                    page: page,
                    size: size
                }
            }

            axios.get(url, config)
            .then((response) => {
                setPosts(response.data.items);
            })
            .catch(err => {
                if (err.response.status === 404) {
                    setPosts([]);
                } else if (err.response.status === 401) {
                    navigate('/unauthorized');
                } else if (err.response.status === 500) {
                    setPosts([]);
                }
            });
            
            let updated = page + 1;
            config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: url,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                params: {
                    page: updated,
                    size: size
                }
            }

            axios.get(url, config)
            .then((response) => { 
                if (response.data[0]) { setSeeMore(true); }
            })
            .catch(err => {
                if (err.response.status === 500) {
                    setPosts([]);
                } else if (err.response.status === 404) {
                    setSeeMore(true);
                } else if (err.response.status === 401) {
                    navigate('/unauthorized');
                }
            });
            
        } 
    }, [url, navigate, page, size]);

    const getMore = () => {
        /**
         * Description:  
         * Request: (if axios is used)    
         * Returns: 
         */
        console.log('Debug: <TLDR what the function is doing>')
        if (!seeMore) {
            let updated = page + 1;
            setPage(updated);
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: url,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                params: {
                    page: updated,
                    size: size
                }
            }

            axios.get(url, config)
            .then((response) => { 
                let more = []
                for (let i = 0; i < response.data.items.length; i++) {
                    more.push(response.data.items[i]);
                }
                setPosts(posts.concat(more));
                if (response.data.items.length < size) {
                    setSeeMore(true);
                } 
            })
            .catch(err => {
                if (err.response.status === 404) {
                    setPosts(posts);
                } else if (err.response.status === 401) {
                    navigate('/unauthorized');
                } else if (err.response.status === 500) {
                    // TEMPORARY
                    setPosts(posts);
                }
            });
        }
        let updated = page + 2;
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: url,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            params: {
                page: updated,
                size: size
            }
        }

        axios
        .get(url, config)
        .then((response) => { 
            if (response.data.items.length === 0) { setSeeMore(true); }
        })
        .catch(err => {
            console.log(err);
            if(err.response){
                if (err.response.status === 404) {
                    setPosts(posts);
                } else if (err.response.status === 401) {
                    navigate('/unauthorized');
                } else if (err.response.status === 500) {
                    // TEMPORARY
                    setPosts(posts);
                }
            }
            
        });
        
    }

    return (
        <div>
            { posts.length === 0 ? 
                <div>
                    <h4>No posts to show.</h4>
                </div> : 
                <div> 
                    <Pagination>
                        {Object.keys(posts).map((post, idx) => (
                            <Post key={idx} viewerId={userInfo.authorId} post={posts[post]} author={userInfo}/>
                        ))}  
                        { seeMore ? null :
                            <div>
                                <Pagination.Item disabled={seeMore} onClick={getMore}>See More</Pagination.Item>
                            </div>
                        }
                    </Pagination>  
                </div>
            }
        </div>
    )
}

export default Posts;
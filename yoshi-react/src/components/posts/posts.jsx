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

function Posts({viewerId, url}) { 
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [seeMore, setSeeMore] = useState(false);
    const size = 5;
    const navigate = useNavigate();

    useEffect(() => {
        console.log('Debug: Fetching all public posts.')
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: url,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            params: {
                page: page,
                size: size
            }
        }

        axios
        .get(url, config)
        .then((response) => { 
            let posts = []
            for (let i = 0; i < size; i++) {
                posts.push(response.data.items[i]);
            }
            setPosts(posts);
        })
        .catch(err => {
            if (err.response.status === 404) {
                console.warn = () => {};
                setPosts([]);
            } else if (err.response.status === 401) {
                navigate('/unauthorized');
            } else if (err.response.status === 500) {
                // TEMPORARY
                setPosts([]);
            }
        });

        let updated = page + 1;
        config = {
            method: 'post',
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
            if (err.response.status === 404) {
                setSeeMore(true);
            } else if (err.response.status === 401) {
                navigate('/unauthorized');
            } else if (err.response.status === 500) {
                setPosts([]);
            }
        });
    }, [setPosts, url, navigate, page, size, posts, viewerId]);

    const getMore = () => {
        if (!seeMore) {
            let updated = page + 1;
            setPage(updated);
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: '/api/authors/' + viewerId + '/posts/public',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                params: {
                    page: updated,
                    size: size
                }
            }

            axios
            .get('/api/authors/' + viewerId + '/posts/public', config)
            .then((response) => { 
                let more = []
                for (let i = 0; i < size; i++) {
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
                    navigate('500 PAGE')
                }
            });
        }
        let updated = page + 2;
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/api/authors/' + viewerId + '/posts/public',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            params: {
                page: updated,
                size: size
            }
        }

        axios
        .get('/api/authors/' + viewerId + '/posts/public', config)
        .then((response) => { 
            if (response.data.items.length === 0) { setSeeMore(true); }
        })
        .catch(err => {
            if (err.response.status === 404) {
                setPosts(posts);
            } else if (err.response.status === 401) {
                navigate('/unauthorized');
            } else if (err.response.status === 500) {
                navigate('500 PAGE')
            }
        });
    }

    return (
        <div>
            { posts === undefined || posts.length === 0 ? 
                <div>
                    <h4>No posts to show.</h4>
                </div> : 
                <div> 
                    <Pagination>
                        {Object.keys(posts).map((post, idx) => (
                            <Post key={idx} viewerId={viewerId} post={posts[post]}/>
                        ))}  
                        { seeMore ? null :
                            <div>
                                <Pagination.Item onClick={getMore}>See More</Pagination.Item>
                            </div>
                        }
                    </Pagination>  
                </div>
            }
        </div>
    )
}

export default Posts;
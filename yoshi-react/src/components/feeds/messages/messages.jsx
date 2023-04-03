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
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// User Interface 
import TopNav from '../navs/top/nav.jsx';
import LeftNavBar from '../navs/left/nav.jsx';
import RightNavBar from '../navs/right/nav.jsx';
import Post from "../../posts/post.jsx";
import { Pagination } from "react-bootstrap";


function Messages() {
    /**
     * Description: Represents the Messages page that authors will keep their private posts with specific authors 
     * Functions: 
     *     - checkExpiry(): Checks if the current token is expired
     *     - useEffect(): Checks if the current token is expired before render, so that the author can be logged out if needed 
     *     - logOut(): Logs out an author and sends them to the Welcome component 
     * Returns: N/A
     */
    console.log('Debug: <TLDR what the function is doing>')
    const [viewer, setViewer] = useState({ viewerId: '' });
    const [messengers, setMessengers] = useState([]);
    const [currentMessenger, setCurrentMessenger] = useState('');
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [seeMore, setSeeMore] = useState(false);
    const size = 5;
    console.log(currentMessenger)

    useEffect(() => {
        /**
         * Description: Before render, checks the author's account details
         * Request: POST
         * Returns: N/A
         */
        console.log('Debug: <TLDR what the function is doing>')
        const getAuthor = () => {
            axios
            .get('/userinfo')
            .then((response) => {
                let viewerId = response.data.authorId;
                setViewer({ viewerId: viewerId })
            })
            .catch(err => { });
        }

        getAuthor();
    }, [navigate])

    useEffect(() => {
        /**
         * Description: Before render, checks the author's account details
         * Request: POST
         * Returns: N/A
         */
        console.log('Debug: <TLDR what the function is doing>')
        const getPrivatePosts = async () => {
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: '/authors/' + viewer.viewerId + '/inbox',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                params: {
                    page: 1,
                    size: size
                }
            }
            let messengers = []
            let curr = '';
            let posts = []
            await axios
            .get('/authors/' + viewer.viewerId + '/inbox', config)
            .then((response) => {
                posts = response.data.items;
                if (response.data.items !== undefined && response.data.items.length !== 0) {
                    for (let i = 0; i < response.data.items.length; i++) {
                        if (response.data.items[i].visibility === 'PRIVATE') {
                            let idx = messengers.map(obj => obj.displayName).indexOf(response.data.items[i].author.displayName);
                            if (idx <= -1) { 
                                messengers.push(response.data.items[i].author);
                            } 
                        }
                    }
                    if (messengers.length !== 0 && currentMessenger === undefined) {
                        curr = messengers[0].url
                    } else {
                        curr = currentMessenger
                    }
                }
            })
            .catch(err => { });


            if (messengers.length !== 0) {
                setPosts((posts).filter(post => curr === post.author.url && post.visibility === 'PRIVATE'))
            }
            setMessengers(messengers);
            setCurrentMessenger(curr);

            config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: '/authors/' + viewer.viewerId + '/inbox',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                params: {
                    page: 2,
                    size: size
                }
            }
            axios
            .get('/authors/' + viewer.viewerId + '/inbox', config)
            .then((response) => { 
                if (response.data.items !== undefined) { 
                    const nextSet = response.data.items.filter(post => curr === post.author.url && post.visibility === 'PRIVATE');
                    if (nextSet.length !== 0) {
                        setSeeMore(true); 
                    }
                }
            })
            .catch(err => { });
        }

        if (viewer.viewerId !== '') {
            getPrivatePosts();
        }
    }, [currentMessenger, viewer.viewerId])

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
                url: '/authors/' + viewer.viewerId + '/inbox',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                params: {
                    page: updated,
                    size: size
                }
            }

            axios
            .get('/authors/' + viewer.viewerId + '/inbox', config)
            .then((response) => { 
                const nextSet = (response.data.items).filter(post => currentMessenger === post.author.url && post.visibility === 'PRIVATE');
                if (nextSet.length !== 0) {
                    setPosts(posts.concat(nextSet));
                }
                if (nextSet.length < size) {
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
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: '/authors/' + viewer.viewerId + '/inbox',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            params: {
                page: page + 1,
                size: size
            }
        }

        axios
        .get('/authors/' + viewer.viewerId + '/inbox', config)
        .then((response) => { 
            const nextSet = response.data.items.filter(post => currentMessenger === post.author.url && post.visibility === 'PRIVATE');
            if (nextSet.length !== 0) {
                setSeeMore(true); 
            }
        })
        .catch(err => { });
    }

    return (
        <div>
            <TopNav/>
            <div className='pubRow'>
                <div className='pubColL'>
                    <LeftNavBar authorId={viewer.viewerId} messengers={messengers} currentMessenger={currentMessenger} setCurrentMessenger={setCurrentMessenger}/>
                </div>
                <div className='pubColM'>
                    <div style={{paddingLeft: '1em'}}>
                        { posts.length === 0 ? 
                            <div>
                                <h4>No posts to show.</h4>
                            </div> : 
                            <div> 
                                <Pagination>
                                    {Object.keys(posts).map((post, idx) => (
                                        <Post key={idx} viewerId={viewer.viewerId} post={posts[post]}/>
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
                </div>
                <div className='pubColR'>
                    <RightNavBar/>
                </div>
            </div>
        </div>
    )
}

export default Messages;
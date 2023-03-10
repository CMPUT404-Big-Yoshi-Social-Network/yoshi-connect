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
import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
import axios from 'axios';

// Child Component
import CreatePost from '../../../posts/create.jsx';

// User Interface
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import './nav.css';

function RightNavBar() {
    /**
     * Description: Represents the right navigation bar
     * Returns: N/A
     */
    const [username, setUsername] = useState();

    const getUsername = () => {
        //TODO: REFACTOR 
        axios
        .get('/server/nav')
        .then((response) => {
            setUsername(response.data.username)            //console.log('Username:', username);
        })
        .catch(err => {
            setUsername('');
        });
    }
    
    useEffect(() => {
        getUsername();
    }, [username])

    return (
        <Navbar className="right-column">
            <Container>
                <Nav>
                    <div className='rn-div'>
                    {/* TODO: Needs to fetch username  */}
                        <img className='rn-pubUserImg' alt='rn-pubUser' src='/images/public/icon_profile.png' width={40}/>
                        <Nav.Link className='rn-user' href={`/users/${username}`}>{username}</Nav.Link> 
                    </div>
                    <div className='rn-div'>
                        <img className='rn-pubFeedImg' alt='rn-pubFeedImg' src='/images/public/icon_public_feed.png' width={25}/>
                        <Nav.Link className='rn-feed' href="/feed">Public Feed</Nav.Link>
                    </div>
                    <div className='rn-div'>
                        <img className='rn-pubFriendsImg' alt='rn-pubFriend' src='/images/public/icon_friends_feed.png' width={25}/>
                        <Nav.Link className='rn-friends' href="/friends">Friends Feed</Nav.Link>
                    </div>
                    <div className='rn-div'>
                        <img className='rn-pubMsgImg' alt='rn-pubMsgImg' src='/images/public/icon_messages.png' width={25}/>
                        <Nav.Link className='rn-msgs' href="/messages">Messages</Nav.Link>
                    </div>
                    <div className='rn-div'>
                        <img className='rn-pubPostImg' alt='rn-pubPostImg' src='/images/public/icon_create_post.png' width={25}/>
                        <CreatePost className='rn-post'/>
                    </div>
                </Nav>
                <div className='rn-div'>
                    <a href='/settings'>
                        <img className='rn-pubCogImg' alt='rn-pubCogImg' src='/images/public/icon_settings.png' width={25}/>
                    </a>
                </div>
            </Container>
        </Navbar>
    )
}

export default RightNavBar;
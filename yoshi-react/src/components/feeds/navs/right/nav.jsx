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
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Child Component
import CreatePost from '../../../posts/create.jsx';

// User Interface
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import './nav.css';

function RightNavBar() {
    /**
     * Description: Represents the right navigation bar 
     * Functions: 
     *         - useEffect(): Fetches the Author's profile info
     * Returns: N/A
     */
    const [profile, setProfile] = useState({
        username: "", 
        pic: ""
    });
    const navigate = useNavigate();
    
    useEffect(() => {
        /**
         * Description: Fetches the Author's profile info through sending a GET request
         * Request: GET
         * Returns: N/A
         */
        const getId = () => {
            axios
            .get('/userinfo/')
            .then((response) => {
                if (response.data !== null) {
                    setProfile({username: response.data.displayName, pic: response.data.profileImage})
                }
            })
            .catch(err => { if (err.response.status === 404) { 
                setProfile({username: ""})
            } 
            });
        }
        getId();
    }, [navigate])

    return (
        <Navbar className="right-column">
            { window.location.pathname !== '/' ? <Container>
                <Nav>
                    <div className='rn-div'>
                    {/* TODO: Needs to fetch username  */}
                    {profile.pic === "" ? <img className='rn-pubUserImg' alt='rn-pubUser' src='/images/public/icon_profile.png' width={40}/> : <img className='rn-pubUserImg' alt='rn-pubUser' src={profile.pic} width={40}/>}
                        <Nav.Link className='rn-user' href={`/users/${profile.username}`}>{profile.username}</Nav.Link> 
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
			<img className='rn-pubMsgImg' alt='rn-pubMsgImg' src='/images/public/icon_github.png' width={25}/>
                        <Nav.Link className='rn-msgs' href="/github">Github</Nav.Link>
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
            </Container> :
            <div>
                <Button className='rightnav-button' href='/signup' data-testid="signup">Sign Up</Button>
                <Button className='rightnav-button' href='/login' data-testid="login">Log In</Button>
            </div>
            }
        </Navbar>
    )
}

export default RightNavBar;

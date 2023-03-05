import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import './rightNav.css';

function RightNavBar() {
    const [username, setUsername] = useState();

    const getUsername = () => {
        axios
        .get('/server/nav')
        .then((response) => {
            setUsername(response.data.username)            //console.log('Username:', username);
        })
        .catch(err => {
            console.log(err);
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
                    {/* TODO: Create post */}
                        <img className='rn-pubPostImg' alt='rn-pubPostImg' src='/images/public/icon_create_post.png' width={25}/>
                        <Nav.Link className='rn-post'href="/post">Create Post</Nav.Link>
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
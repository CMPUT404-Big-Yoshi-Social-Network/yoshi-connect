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
import React, { useState } from 'react';
import Popup from 'reactjs-popup';

// User Interface
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Form } from 'react-bootstrap';
import Notifications from '../../notifications/notifcation-box';
import './nav.css'
import SearchOutcomes from './searches';

function TopNav(props) {
    /**
     * Description: Represents the top navigation bar 
     * Functions: N/A
     * Returns: N/A
     */
    console.log('Debug: <TLDR what the function is doing>')
    const [newAuthor, setNewAuthor] = useState({newSearch: ''})

    return (
        <Navbar className='topNav'>
            <Navbar.Brand className='topNavBrand'>
                <img className='topLogo' src='/images/yoshi_connect_logo2.png' width={35} height={35} alt='logo'/>
                <h1 className='title'>Yoshi Connect</h1>
            </Navbar.Brand>
            { props.authorId ? 
                <Nav className='topNavSearch'>
                    <Form.Control type="search" placeholder="Search" className="topSearch" onChange={(e) => {setNewAuthor({...newAuthor, newSearch: e.target.value})}}/>
                            <Popup trigger={<button className="search-button">Search</button>} position="right center">
                                <SearchOutcomes url={'/authors/search/' + newAuthor.newSearch}/>     
                            </Popup> 
                </Nav> :
                null
            }
            { props.authorId ? 
                <Nav className='topNavNotif'>
                    <Popup  className='notifPopup' trigger={<img className='notifBell' src='/images/public/icon_notif_bell.png' alt='Notifications' width={30}/>}>
                        <Notifications authorId={props.authorId}/>
                    </Popup>
                </Nav> : 
                null

            }
        </Navbar>
    )
}

export default TopNav;


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
import React from 'react';
import Popup from 'reactjs-popup';

// User Interface
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Form } from 'react-bootstrap';
import Notifications from '../../notifications/notifcation-box';
import './nav.css'

function TopNav() {
    /**
     * Description: Represents the top navigation bar
     * Returns: N/A
     */
    return (
        // TODO: Need to Add Search functionality and Notification Functionality
        // Might need to query notifications and use map (refer to leftNav.jsx
        <Navbar className='topNav'>
            <Navbar.Brand className='topNavBrand' href='/feed'>
                <img className='topLogo' src='/images/yoshi_connect_logo2.png' width={40} height={40} alt='logo'/>
                <h1>Yoshi Connect</h1>
            </Navbar.Brand>
            <Nav className='topNavSearch'>
                <Form.Control type="search" placeholder="Search" className="topSearch"/>
            </Nav>
            <Nav className='topNavNotif'>
                <Popup  className='notifPopup' trigger={<img className='notifBell' src='/images/public/icon_notif_bell.png' alt='Notifications' width={30}/>}>
                    <Notifications/>
                </Popup>
            </Nav>
        </Navbar>
    )
}

export default TopNav;


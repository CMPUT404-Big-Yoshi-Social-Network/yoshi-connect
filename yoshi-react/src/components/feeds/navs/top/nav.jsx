import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Form } from 'react-bootstrap';
import React from 'react';
import Popup from 'reactjs-popup';
import './nav.css'
import Notifications from '../../notifications/notifcation-box';

function TopNav() {
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


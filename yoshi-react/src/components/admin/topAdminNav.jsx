import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import React from 'react';
// import { Form, Nav } from 'react-bootstrap';
import './topAdminNav.css'

function TopAdminNav() {
    return (
        // TODO: Need to Add Search functionality and Notification Functionality
        // Might need to query notifications and use map (refer to leftNav.jsx
        <Navbar className='topAdminNav'>
            <Container>
                <Navbar.Brand className='topAdminNavBrand' href='/feed'>
                    <img className='topAdminLogo' src='/images/yoshi_connect_logo2.png' width={40} height={40} alt='logo'/>
                    <h1>Yoshi Connect</h1>
                </Navbar.Brand>
            </Container>
        </Navbar>
    )
}

export default TopAdminNav;


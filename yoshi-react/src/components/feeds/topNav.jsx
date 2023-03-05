import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Form } from 'react-bootstrap';
import React from 'react';
import './topNav.css'

function TopNav() {
    return (
        // TODO: Need to Add Search functionality and Notification Functionality
        // Might need to query notifications and use map (refer to leftNav.jsx
        <Navbar className='topNav'>
            <Container>
                <Navbar.Brand className='topNavBrand' href='/feed'>
                    <img className='topLogo' src='/images/yoshi_connect_logo2.png' width={40} height={40} alt='logo'/>
                    <h1>Yoshi Connect</h1>
                </Navbar.Brand>
                <Nav className='topNav2'>
                    <Form.Control
                        type="search"
                        placeholder="Search"
                        className="topSearch"
                    />
                    {/* <Nav.Link className='topSearch' href="/search">Search</Nav.Link> */}
                    <Nav.Link className='topNotif' href="/notifications">Notifications</Nav.Link>
                </Nav>
            </Container>
        </Navbar>
    )
}

export default TopNav;

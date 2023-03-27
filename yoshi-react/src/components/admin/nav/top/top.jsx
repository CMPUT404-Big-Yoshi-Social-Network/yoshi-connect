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

// User Interface
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import './top.css'

function TopAdminNav() {
    /**
     * Description: Represents the top navigation bar
     * Returns: N/A
     */
    console.log('Debug: Calling the top admin navigation bar')
    return (
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


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
import { useNavigate } from 'react-router-dom';
import React from "react";
import axios from 'axios';

// User Interface
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import './nav.css';

function SettingsNav() {
    /**
     * Description: Represents the left navigation bar
     * Functions:
     *     - LogOut(): Logs the user out
     * Returns: N/A
     */
    const navigate = useNavigate();
    
    const LogOut = () => {
        /**
         * Description: Logs the user out through a POST request
         * Request: POST
         * Returns: N/A
         */
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/settings/logout',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                message: 'Logging Out'
            }
        }
        axios
        .post('/settings/logout', config)
        .then((response) => { navigate("/"); })
        .catch(err => {
            if (err.response.status === 500) {
                navigate('/servererror');
            } else if (err.response.status === 401) {
                navigate('/unauthorized')
            }
        });
    }
    return (
        <Navbar className="settings-column">
            <Container>
                <h1><Navbar.Brand>Settings</Navbar.Brand></h1>
                <Nav>
                    <div>
                        <img className='rn-pubMsgImg' alt='rn-pubMsgImg' src='/images/public/icon_account.png' width={25}/>
                        <Nav.Link className='setting' href="/settings">Account Details</Nav.Link>
                    </div>
                    <div>
                        <img className='rn-pubMsgImg' alt='rn-pubMsgImg' src='/images/public/icon_logout.png' width={25}/>
                        <Nav.Link className='setting' onClick={() => LogOut()}>Log Out</Nav.Link>
                    </div>
                </Nav>
            </Container>
        </Navbar>
    )
}

export default SettingsNav;
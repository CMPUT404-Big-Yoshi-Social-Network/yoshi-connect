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
//import { useParams } from 'react-router-dom';
// import { useEffect } from 'react';
// import axios from 'axios';

// User Interface
import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import './rightAdminNav.css';

function RightAdminNavBar() {
    /**
     * Description: Represents the right navigation bar
     * Returns: N/A
     */
    //const { username } = useParams();
    return (
        <Navbar className="right-admin-column">
            <Container>
                <Nav>
                    <div className='rn-admdiv'>
                    {/* TODO: Needs to fetch username  */}
                        <img className='rn-admUserImg' alt='rn-admUser' src='/images/public/icon_profile.png' width={40}/>
                        <Nav.Link className='rn-user'href="/users/:username">Username</Nav.Link> 
                    </div>
                    <div className='rn-admdiv'>
                        <img className='rn-admDashImg' alt='rn-admDashImg' src='/images/admin/icon_dashboard.png' width={25}/>
                        <Nav.Link className='rn-admdash' href="/admin/dashboard">Dashboard</Nav.Link>
                    </div>
                    <div className='rn-admdiv'>
                        <img className='rn-admAdminsImg' alt='rn-admAdminsImg' src='/images/admin/icon_admins.png' width={25}/>
                        <Nav.Link className='rn-admadmins' href="/admin/admins">Admins</Nav.Link>
                    </div>
                    <div className='rn-admdiv'>
                        <img className='rn-admUsersImg' alt='rn-admUsersImg' src='/images/admin/icon_users.png' width={25}/>
                        <Nav.Link className='rn-admuser' href="/admin/users">Users</Nav.Link>
                    </div>
                    {/* <div className='rn-admdiv'>
                        <img className='rn-admServerImg' alt='rn-admServerImg' src='/images/icon_create_post.png' width={25}/>
                        <Nav.Link className='rn-admserver'href="/admin/servers">Servers</Nav.Link>
                    </div>
                    <div className='rn-admdiv'>
                        <img className='rn-admNodesImg' alt='rn-admNodesImg' src='/images/icon_messages.png' width={25}/>
                        <Nav.Link className='rn-admnodes' href="/admin/nodes">Nodes</Nav.Link>
                    </div> */}
                </Nav>
                <div className='rn-admdiv'>
                    <a href='/settings'>
                        <img className='rn-admCogImg' alt='rn-admCogImg' src='/images/public/icon_settings.png' width={40}/>
                    </a>
                    <Button href='/feed' variant="warning" type="submit" className='goto-user-dashboard'>User Dashboard</Button>
                </div>
            </Container>
        </Navbar>
    )
}

export default RightAdminNavBar;
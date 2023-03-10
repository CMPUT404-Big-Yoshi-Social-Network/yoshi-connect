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
import React, { useEffect, useState } from "react";
import axios from 'axios';

// Child Component
import TopNav from '../navs/top/nav.jsx';
import LeftNavBar from '../navs/left/nav.jsx';
import RightNavBar from '../navs/right/nav.jsx';

// User Interface
import { Card, Form, Button } from 'react-bootstrap';
import './settings.css';


function Settings() {
    /**
     * Description: Represents the change password page in settings
     * Functions:
     *     - useEffect(): Before rendering, checks if the author is logged in
     *     - useEffect(): Before render, checks the author's account details
     *     - LogOut(): Logs the author out
     *     - modify(): Updates the new author's account details
     * Returns: N/A
     */
    const navigate = useNavigate();
    const [newAuthor, setNewAuthor] = useState({
        newUsername: '',
        newPassword: '',
        newEmail: ''
    })
    useEffect(() => {
        /**
         * Description: Before render, checks if the author is logged in to authorize routing
         * Request: GET
         * Returns: N/A
         */
        const checkExpiry = () => {
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: '/feed',
            }
            axios
            .get('/server/feed', config)
            .then((response) => {
                if (response.data.status === "Expired") {
                    console.log("Debug: Your token is expired.")
                    LogOut();
                    navigate('/');
                }
                else{console.log('Debug: Your token is not expired.')}
            })
            .catch(err => {
                if (err.response.status === 401) {
                    console.log("Debug: Not authorized.");
                    navigate('/unauthorized'); // 401 Not Found
                }
            });
        }
        checkExpiry();
    })
    useEffect(() => {
        /**
         * Description: Before render, checks the author's account details
         * Request: POST
         * Returns: N/A
         */
        const getAuthor = () => {
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: '/server/settings/',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    status: 'Get Author'
                }
            }
            axios
            .post('/server/settings/', config)
            .then((response) => {
                setNewAuthor({
                    newUsername: response.data.username,
                    newEmail: response.data.email
                })
            })
            .catch(err => { });
        }
        getAuthor();
    }, [])
    const LogOut = () => {
        /**
         * Description: Logs the author out
         * Request: POST
         * Returns: N/A
         */
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/server/feed',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                message: 'Logging Out'
            }
        }
        axios
        .post('/server/feed', config)
        .then((response) => {
            localStorage['sessionId'] = "";
            navigate("/");
        })
        .catch(err => {
          console.error(err);
        });
    }
    const modify = (e) => {
        /**
         * Description: Updates the new author's account details
         * Request: PUT
         * Returns: N/A
         */
        e.preventDefault();
        console.log('Debug: Attempting to modify an author.');
        let config = {
            method: 'put',
            maxBodyLength: Infinity,
            url: '/server/settings',
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: {
                status: 'Modify an Author',
                newUsername: newAuthor.newUsername,
                newPassword: newAuthor.newPassword,
                newEmail: newAuthor.newEmail
            }
        }

        axios
        .put('/server/settings', config)
        .then((response) => {
            console.log('Debug: Author has been updated!')
        })
        .catch(err => {
            console.error(err);
        });
    }
    return (
        <div className='settings'>
            <TopNav/>
            <div className='pubRow'>
                <div className='pubColL'>
                    <LeftNavBar/>
                </div>
                <div className='pubColM'>
                    <div className='settingColM'>
                        <div className='profile-heading'>
                            <img className='ad-pubUserImg' alt='ad-pubUser' src='/images/public/icon_profile.png' width={40}/>
                        </div>
                        <Card.Body>
                            <Form className='account-details-form'>
                                <Form.Group className="account-details-a">
                                    <p>Username</p>
                                        <Form.Control
                                            //href={`/users/${username}`}>{username} 
                                            name="username"
                                            value={newAuthor.newUsername}
                                            autoComplete="off"
                                            onChange={(e) => {setNewAuthor({...newAuthor, newUsername: e.target.value})}}
                                            type="text" className='account-details-box'/>
                                </Form.Group>
                                <Form.Group className="account-details-a">
                                    <p>Email</p>
                                    <Form.Control
                                        name="email"
                                        value={newAuthor.newEmail}
                                        onChange={(e) => {setNewAuthor({...newAuthor, newEmail: e.target.value})}}
                                        type="email" className='account-details-box'/>
                                </Form.Group>
                                <Form.Group className="account-details-a">
                                    <p>Password</p>
                                    <Form.Control
                                        name="password"
                                        onChange={(e) => {setNewAuthor({...newAuthor, newPassword: e.target.value})}}
                                        type="password" className='account-details-box'/>
                                </Form.Group>
                                <br></br>
                                <Button onClick={modify} variant="warning" type="submit" className='save-setting'>Save</Button>
                                </Form>
                            </Card.Body>
                        </div>
                    </div>
                <div className='pubColR'>
                    <RightNavBar/>
                </div>
            </div>
        </div>
    )
}

export default Settings;
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
import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Popup from 'reactjs-popup';

// Child Component
import Authors from './authors.jsx';
import AddAuthor from "./addForm.jsx";
import TopAdminNav from './topAdminNav.jsx';
import LeftAdminNavBar from './leftAdminNav.jsx';
import RightAdminNavBar from './rightAdminNav.jsx';

// Styling
import './admin-dashboard.css';

function AdminDashboard() {
    /**
     * Description: Represents the admin page 
     * Functions:
     *     - getDashboard(): Sends a GET request to retreive the admin dashboard authorization 
     *     - LogOut(): Logs the admin out
     * Returns: N/A
     */
    const navigate = useNavigate();
    const url = '/api/admin/dashboard';

    const getDashboard = () => {
        /**
         * Description: Sends a GET request to retreive the admin dashboard authorization
         * Request: GET
         * Returns: N/A
         */
        console.log('Debug: Getting Admin Dashboard.')
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: '/',
        }
        axios
        .get(url, config)
        .then((response) => { })
        .catch(err => {
            if (err.response.status === 403) {
                console.log("Debug: Forbidden.");
                navigate('/forbidden'); 
            } else if (err.response.status === 401) {
                console.log("Debug: Your token is expired.");
                LogOut();
                navigate('/welcome');
            }
        });
    }
    useEffect(() => {
       getDashboard();
    });
    const LogOut = () => {
        /**
         * Description: Sends a POST request to log the admin out
         * Request: POST
         * Returns: N/A
         */
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: url,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                status: 'Logging Out'
            }
        }
        axios
        .post(url, config)
        .then((response) => {
            navigate("/");
        })
        .catch(err => {
          console.error(err);
        });
    }
    return (
        <div>            
            <TopAdminNav/>
            <div className='adminRow'>
                <div className='adminColL'>
                    <LeftAdminNavBar/>
                </div>
                <div className='adminColM'>
                    <div className='admin-dashboard' style={{paddingLeft: '1em'}}>
                        <h1>Admin Dashboard</h1>
                        <button className='author-buttons' type="button" onClick={() => LogOut()}>Log Out</button>
                        <Popup trigger={<button className="author-buttons">Add New Author</button>} position="right center">
                            <AddAuthor/>
                        </Popup>
                        <div><Authors/></div>
                    </div>
                </div>
                <div className='adminColR'>
                    <RightAdminNavBar/>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard;
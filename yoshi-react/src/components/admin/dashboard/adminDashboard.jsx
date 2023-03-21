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
import Authors from '../author/authors.jsx';
import AddAuthor from "../forms/addForm.jsx";
import InNodes from '../node/inNodes.jsx';
import OutNodes from '../node/outNodes.jsx';
import AddNode from "../forms/addNode.jsx";
import TopAdminNav from '../nav/top/top.jsx';
import LeftAdminNavBar from '../nav/left/left.jsx';
import RightAdminNavBar from '../nav/right/right.jsx';

// Styling
import './adminDashboard.css';

function AdminDashboard() {
    /**
     * Description: Represents the admin page 
     * Functions:
     *     - getDashboard(): Sends a GET request to retreive the admin dashboard authorization 
     *     - LogOut(): Logs the admin out
     * Returns: N/A
     */
    const navigate = useNavigate();
    const url = '/admin/dashboard';

    const getDashboard = () => {
        axios
        .get(url)
        .then((response) => { })
        .catch(err => {
            if (err.response.status === 403) {
                navigate('/forbidden'); 
            } else if (err.response.status === 401) {
                LogOut();
                navigate('/');
            }
        });
    }
    useEffect(() => {
       getDashboard();
    });

    const LogOut = () => {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: url,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
        axios
        .post(url, config)
        .then((response) => { navigate("/"); })
        .catch(err => {
          if (err.response.status === 500) {
            console.log('500 PAGE');
          } else if (err.response.status === 401) {
            navigate('/unauthorized')
          }
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
                        <Popup trigger={<button>Add Node</button>} position="right center">
                            <AddNode/>
                        </Popup>
                        <div><InNodes/></div>
                        <div><OutNodes/></div>
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
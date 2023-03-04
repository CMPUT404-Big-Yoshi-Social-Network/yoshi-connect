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

import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Authors from './authors.jsx';
import AddAuthor from "./addForm.jsx";
import Popup from 'reactjs-popup';
function AdminDashboard() {
    const navigate = useNavigate();
    const url = '/server/admin/dashboard';

    const getDashboard = () => {
        console.log('Debug: Getting Admin Dashboard.')
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: '/',
        }
        axios
        .get(url, config)
        .then((response) => {
            if (response.data.status === "Expired") {
                console.log("Debug: Your token is expired.");
                LogOut();
                navigate('/login');
            } else if(response.data.status === "NonAdmin"){
                console.log("Debug: You're not an admin.")
                navigate('/forbidden');
            } else {
                console.log("Successfully logged in");
            }
            console.log('Debug: Your token is not expired.')
        })
        .catch(err => {
            if (err.response.status === 403) {
                console.log("Debug: Forbidden.");
                navigate('/forbidden'); 
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
            <h1>Admin Dashboard</h1>
            <button type="button" onClick={() => LogOut()}>Log Out</button>
            <Popup trigger={<button>Add New Author</button>} position="right center">
                <AddAuthor/>
            </Popup>
            <div><Authors/></div>
        </div>
    )
}

export default AdminDashboard;
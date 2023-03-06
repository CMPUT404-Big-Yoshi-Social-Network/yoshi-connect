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
import axios from 'axios';
import Popup from 'reactjs-popup';
import { useState } from 'react';

// Child Componet
import ModifyAuthor from "./modifyForm.jsx";

// Styling
import './author.css';

function Author(props) {
    const [username, setUsername] = useState('');
    const url = '/server/admin/dashboard';
    useEffect(() => {
        setUsername(props.username)
     }, [props]);
    const deleteAuthor = () => {
        console.log('Debug: Deleting this author.')
        let config = {
            method: 'delete',
            maxBodyLength: Infinity,
            url: url,
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                username: username,
                status: 'Delete an Author'
            }
        }
        axios
        .delete(url, config)
        .then((response) => {
        })
        .catch(err => {
            console.error(err);
        });
    }
    return (
        <div className='author-div' id='author'>
            { props.username }
            <div className='author-button-div'>
                <button className='author-buttons' type="button" id='delete' onClick={() => deleteAuthor()}>Delete</button>
                <Popup trigger={<button className='author-buttons'>Modify</button>} position="right center">
                    <ModifyAuthor {...props}/>
                </Popup>
            </div>
        </div>
    )
}

export default Author;
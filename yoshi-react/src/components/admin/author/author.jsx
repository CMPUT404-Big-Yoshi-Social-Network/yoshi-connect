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
import React from "react";
import axios from 'axios';
import Popup from 'reactjs-popup';
import { useNavigate } from 'react-router-dom';

// Child Componet
import ModifyAuthor from "../forms/modifyForm.jsx";

// Styling
import './author.css';

function Author(props) {
    const url = '/admin/dashboard';
    const navigate = useNavigate();

    const deleteAuthor = () => {
        let config = {
            method: 'delete',
            maxBodyLength: Infinity,
            url: url,
            headers: { 'Content-Type': 'application/json' },
            data: {
                author: props
            }
        }
        axios
        .delete(url, config)
        .then((response) => { })
        .catch(err => {
            if (err.response.status === 404) {
                navigate('/notfound');
            } else if (err.response.status === 500) {
                console.log('STATUS 500 PAGE')
            }
        });
    }

    const allowAuthor = () => {
        let config = props
        axios
        .put(url, config)
        .then((response) => { })
        .catch(err => {
            if (err.response.status === 400) {
                navigate('/badrequest');
            } else if (err.response.status === 404) {
                navigate('/notfound');
            } else if (err.response.status === 500) {
                console.log('NEED A 500 STATUS PAGE')
            }
        });
    }
    
    return (
        <div className='author-div' id='author'>
            { props.displayName === undefined ? null : 
                <div>
                    { props.displayName }
                    <div className='author-button-div'>
                        <button className='author-buttons' type="button" id='delete' onClick={() => deleteAuthor()}>Delete</button>
                        <button className='author-buttons' type="button" id='enable' onClick={() => allowAuthor()}>Enable</button>
                        <button className='author-buttons' type="button" id='disable' onClick={() => allowAuthor()}>Disable</button>
                        <Popup trigger={<button className='author-buttons'>Modify</button>} position="right center">
                            <ModifyAuthor {...props}/>
                        </Popup>
                    </div>
                </div>
            }
        </div>
    )
}

export default Author;
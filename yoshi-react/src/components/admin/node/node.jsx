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
import ModifyNode from "../forms/modifyNode.jsx";

function Node(props) {
    const url = '/admin/dashboard';
    const navigate = useNavigate();

    const deleteNode = () => {
        let config = {
            method: 'delete',
            maxBodyLength: Infinity,
            url: url,
            headers: { 'Content-Type': 'application/json' },
            data: {
                node: props
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

    const allowNode = () => {
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
        <div>
            { props.displayName === undefined ? null : 
                <div>
                    { props.displayName }
                    <div>
                        <button type="button" id='delete' onClick={() => deleteNode()}>Delete</button>
                        <button type="button" id='enable' onClick={() => allowNode()}>Enable</button>
                        <button type="button" id='disable' onClick={() => allowNode()}>Disable</button>
                        <Popup trigger={<button>Modify</button>} position="right center">
                            <ModifyNode {...props}/>
                        </Popup>
                    </div>
                </div>
            }
        </div>
    )
}

export default Node;
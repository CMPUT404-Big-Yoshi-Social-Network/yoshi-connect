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
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

// User Interface
import { Button } from 'react-bootstrap';

function SearchCard(props) {
    const username = props.username !== undefined ? props.username : props.displayName
    const host = props.host === "" ? 'http://sociallydistributed.herokuapp.com' : props.host
    const [requestButton, setRequestButton] = useState('Send Follow Request');
    /**
     * Description:     
     * Returns: 
     */
    console.log('Debug: <TLDR what the function is doing>')
    const [viewerId, setViewerId] = useState('')
    const [viewer, setViewer] = useState({})
    const navigate = useNavigate();

    useEffect(() => {
        /**
         * Description: Fetches the current author's id and the public and following (who the author follows) posts  
         * Returns: N/A
         */
        console.log('Debug: <TLDR what the function is doing>')
        const getId = () => {
            /**
             * Description: Sends a POST request to get the current author's id 
             * Request: POST
             * Returns: N/A
             */
            console.log('Debug: <TLDR what the function is doing>')
            axios
            .get('/userinfo/')
            .then((response) => {
                let viewerId = response.data.authorId;
                let viewer = response.data;
                setViewerId(viewerId)
                setViewer(viewer)
            })
            .catch(err => { if (err.response.status === 404) { 
                setViewerId('')
            }})
        }
        getId();
    }, [navigate]);

    const sendRequest = () => {
        setRequestButton('Sent');
        let id = props.id.split(host + '/authors/')[1];
        let config = {
            summary: viewer + " wants to follow " + username,
            actor: viewer,
            actorId: viewerId,
            objectId: id,
            object: props
        }
        axios
        .post('/nodes/outgoing/authors/' + id + '/inbox/follow', config)
        .then((response) => { })
        .catch(err => { });
    }

    const seePosts = () => {
        if (host === 'https://yoshi-connect.herokuapp.com/') {
            navigate('/users/' + username);
        } else {
            let id = props.id.split(host + '/authors/')[1];
            axios
            .get('/outgoing/authors/' + id + '/posts')
            .then((response) => { })
            .catch(err => { if (err.response.status === 404) { 
                setViewerId('')
            }})
        }
    }

    return (
        <div>
            { !props && username === undefined ? null : 
                <div>
                    {username}
                    <br></br>
                    {host}
                    <Button onClick={seePosts} type="submit">View Profile</Button>
                    <Button onClick={sendRequest} type="submit">{requestButton}</Button>
                </div>
            }
        </div>
    )
}

export default SearchCard;
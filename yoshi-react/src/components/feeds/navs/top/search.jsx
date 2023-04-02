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
    const host = props.host === "" ? 'https://sociallydistributed.herokuapp.com' : props.host
    const [requestButton, setRequestButton] = useState('Add');
    /**
     * Description:     
     * Returns: 
     */
    console.log('Debug: <TLDR what the function is doing>')
    const [viewerId, setViewerId] = useState('')
    const [viewer, setViewer] = useState({})
    const navigate = useNavigate();
    let id = props.id.split('/')
    id = id[id.length - 1]

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
                let id = response.data.id.split('/')
                id = id[id.length - 1]
                let viewer = response.data;
                setViewerId(id)
                setViewer(viewer)
            })
            .catch(err => { if (err.response.status === 404) { 
                setViewerId('')
            }})
        }
        getId();
    }, [navigate]);

    useEffect(() => {
        /**
         * Description: Fetches the current author's id and the public and following (who the author follows) posts  
         * Returns: N/A
         */
        console.log('Debug: <TLDR what the function is doing>')
        if (viewerId !== null && viewerId !== undefined && viewerId !== '') {
            let config = {
                isLocal: (host === 'https://yoshi-connect.herokuapp.com/') || (host === 'https://yoshi-connect.herokuapp.com') || host === ('http://localhost:3000/')
            }
            axios
            .post('/authors/' + viewerId + '/friends/' + id, config)
            .then((response) => {
                if (response.data.status === 'Friends') {
                    setRequestButton('Unfriend');
                } else if (response.data.status === 'Follows') {
                    setRequestButton('Unfollow');
                } else if (response.data.status === 'Strangers') {
                    setRequestButton('Add');
                }
            })
            .catch(err => {
                if (err.response.status === 500) { console.log('500 PAGE') }
            });
        }
    }, [id, viewerId, host]);

    useEffect(() => {
        if (viewerId !== null && viewerId !== undefined && viewerId !== '') {
            if (host === 'https://yoshi-connect.herokuapp.com/' || host === 'http://localhost:3000/') { 
                axios
                .get('/authors/' + viewerId + '/inbox/requests/' + id)
                .then((response) => { 
                    setRequestButton('Sent');
                })
                .catch(err => {
                    if (err.response.status === 404) { }
                });
            }
        }
    }, [viewerId, id, host]);

    const sendRequest = () => {
        setRequestButton('Sent');
        let config = '';
        let url = '';
        if (host === 'https://yoshi-connect.herokuapp.com/' || host === 'http://localhost:3000/') {
            url = '/authors/' + id + '/inbox'
            config = {
                actor: {
                    id: host + 'authors/' + viewerId,
                    status: 'local'
                },
                type: 'follow'
            }
        } else {
            url = '/nodes/outgoing/authors/' + id + '/inbox/follow'
            config = {
                summary: viewer.displayName + " wants to follow " + username,
                actor: viewer,
                actorId: viewerId,
                objectId: id,
                object: props
            }
        }
        axios
        .post(url, config)
        .then((response) => { })
        .catch(err => { });
    }

    const seePosts = () => {
        if (props.host === 'https://yoshi-connect.herokuapp.com/' || props.host === 'http://localhost:3000/') {
            navigate('/users/' + username);
        } else {
            let id = props.id.substring(props.id.lastIndexOf("/") + 1, props.id.length);
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: '/nodes/outgoing/authors/' + id + '/posts',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                params: {
                    page: 1,
                    size: 5
                }
            }
            axios
            .get('/nodes/outgoing/authors/' + id + '/posts', config)
            .then((response) => { 
                navigate('/users/' + username, { state: { posts: response.data.items } })
            })
            .catch(err => { })
        }
    }

    return (
        <div>
            { !props && username === undefined ? null : 
                <div>
                    <p className='search-username'>{username}</p>
                    <p>{host}</p>
                    <Button onClick={seePosts} type="submit">View Profile</Button>
                    <Button className='search-button' onClick={sendRequest} type="submit">{requestButton}</Button>
                </div>
            }
        </div>
    )
}

export default SearchCard;
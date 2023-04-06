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
    /**
     * Description: Represents the Search Card
     * Functions: 
     *     - getId(): Gets the current Author's id 
     *     - useEffect(): 
     *          - Fetches the current Author's id and the public and following (who the author follows) posts
     *          - Sends a DELETE request to delete a comment on a specific post 
     *     - sendRequest(): Sends a request to the Author's inbox
     *     - seePosts(): Displays posts from other servers
     * Returns: N/A
     */
    const username = props.username !== undefined ? props.username : props.displayName
    let h = props.host.split('/authors/')[0].split("/")[2] === "localhost:3000" ? props.host.split('/authors/')[0].split("/")[2] : props.host.split('/authors/')[0].split("/")[2].split(".")[0] === "www" ? props.host.split('/authors/')[0].split("/")[2].split(".")[1] + "." + props.host.split('/authors/')[0].split("/")[2].split(".")[2]: props.host.split('/authors/')[0].split("/")[2].split(".")[0];
    const [requestButton, setRequestButton] = useState('Add');
    
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
        const getId = () => {
            /**
             * Description: Sends a POST request to get the current author's id 
             * Request: POST
             * Returns: N/A
             */
            axios
            .get('/userinfo/')
            .then((response) => {
                if (response.data !== null) { 
                    let viewerId = response.data.authorId;
                    let viewer = response.data;
                    setViewerId(viewerId)
                    setViewer(viewer)
                }
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
        if (viewerId !== null && viewerId !== undefined && viewerId !== '') {
            let config = {
                isLocal: (h === 'https://yoshi-connect.herokuapp.com/') || (h === 'https://yoshi-connect.herokuapp.com') || h === ('http://localhost:3000/')
            }
            axios
            .post('/authors/' + viewerId + '/friends/' + id, config)
            .then((response) => {
                if (response.data.status === 'Friends') {
                    setRequestButton('Unfriend');
                } else if (response.data.status === 'Follows') {
                    setRequestButton('Unfollow');
                } else if (response.data.status === 'Strangers') {
                    if (h === 'https://yoshi-connect.herokuapp.com/' || h === 'http://localhost:3000/') { 
                        axios
                        .get('/authors/' + viewerId + '/inbox/requests/' + id)
                        .then((response) => { 
                            if (response.data.summary !== 'No request found') {
                                setRequestButton('Sent');
                            }
                        })
                        .catch(err => {
                            if (err.response.status === 404) { }
                        });
                    } else {
                        setRequestButton('Add');
                    }
                }
            })
            .catch(err => {
                if (err.response.status === 500) { console.log('500 PAGE') }
            });
        }
    }, [id, viewerId, h]);

    const sendRequest = () => {
        /**
         * Description: Sends a request to the Author's inbox through sending a POST request
         * Request: POST
         * Returns: N/A
         */
        if (requestButton === "Add") { 
            setRequestButton('Sent');
            let config = '';
            let url = '';
            if (id !== undefined) {
                if (h === 'https://yoshi-connect.herokuapp.com/' || h === 'http://localhost:3000/') {
                    url = '/authors/' + id + '/inbox'
                    config = {
                        actor: {
                            id: h + 'authors/' + viewerId,
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
                if (viewer.displayName !== undefined) {
                    axios
                    .post(url, config, {
                        "X-Requested-With": "XMLHttpRequest"
                    })
                    .then((response) => { })
                    .catch(err => { });
                }
            }
        } else if (requestButton === "Sent") {
            setRequestButton('Add')
            axios
            .delete('/authors/' + id + '/inbox/requests/' + viewerId)
            .then((response) => { })
            .catch(err => { });
        } else if (requestButton === 'Unfriend' || requestButton === "Unfollow") {
            let completed = false;
            axios
            .delete('/authors/' + viewerId + '/followings/' + id)
            .then((response) => {
                if (response.data.status === 204) {
                    completed = true;
                } else {
                    completed = false;
                }
            })
            .catch(err => { });
            axios
            .delete('/authors/' + id + '/followers/' + viewerId)
            .then((response) => {
                if (response.data.status === 204) {
                    completed = true;
                } else {
                    completed = false;
                }
            })
            .catch(err => { });
            if (requestButton === 'Unfriend') {
                axios
                .delete('/authors/' + id + '/followings/' + viewerId)
                .then((response) => {
                    if (response.data.status === 204) {
                        completed = true;
                    } else {
                        completed = false;
                    }
                })
                .catch(err => { });
                axios
                .delete('/authors/' + viewerId + '/followers/' + id)
                .then((response) => {
                    if (response.data.status === 204) {
                        completed = true;
                    } else {
                        completed = false;
                    }
                })
                .catch(err => { });
            }
            if (completed) {
                setRequestButton('Add');
            }
        } 
    }

    const seePosts = () => {
        /**
         * Description: Displays posts from other servers
         * Returns: N/A
         */
        if (props.host === 'https://yoshi-connect.herokuapp.com/' || props.host === 'http://localhost:3000/') {
            navigate('/users/' + username);
        } else {
            let id = props.id.substring(props.id.lastIndexOf("/") + 1, props.id.length);
            navigate('/users/' + username, { state: { url: '/nodes/outgoing/authors/' + id + '/posts', isRemote: true } })
        }
    }

    return (
        <div>
            <h4>{h === "localhost:3000" ? 'yoshi-connect' : h}</h4>
            <p className="search-username">{username}</p>
            <Button className="search-button" onClick={seePosts} type="submit">View Profile</Button>
            { id === viewerId ? null : 
                <Button className="search-button" onClick={sendRequest} type="submit">{requestButton}</Button>
            }
            <hr/>
        </div>
    )
}

export default SearchCard;
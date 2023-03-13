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
import axios from 'axios';
import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import Pagination from 'react-bootstrap/Pagination';

// Child Component
import Request from './request.jsx';

function Requests(props) {
    /**
     * Description: Represents all the requests
     * Functions:
     *     - useEffect(): Before render, checks the and sends the requests
     * Returns: N/A
     */
    const [requests, setRequests] = useState([]);
    const navigate = useNavigate();
    const [seeMore, setSeeMore] = useState(false);
    const [page, setPage] = useState(1);
    const size = 5;
    const url = '/api/authors/' + props.authorId + '/requests';

    useEffect(() => {
        /**
         * Description: Before render, checks the author ID and sends the username
         * Request: POST
         * Returns: N/A
         */
        console.log('Debug: Fetching all the requests for this user')
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: url,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
        axios
        .get(url, config)
        .then((response) => {
            if (response.data.items.length !== 0) {
                setRequests(response.data.items)
            }
        })
        .catch(err => {
            if (err.response.status === 404) { 
                setRequests([]);
            } else if (err.response.status === 401) {
                navigate('/unauthorized');
            }
        });

        let updated = page + 1;
        config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: url,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            params: {
                page: updated,
                size: size
            }
        }

        axios
        .get(url, config)
        .then((response) => { 
            if (response.data.items.length === 0) { setSeeMore(true); }
        })
        .catch(err => {
            if (err.response.status === 404) {
                setRequests(requests);
            } else if (err.response.status === 401) {
                navigate('/unauthorized');
            } else if (err.response.status === 500) {
                setRequests(requests);
            }
        });
    }, [setRequests, url, props, navigate, page, size, requests]);

    const getMore = () => {
        if (!seeMore) {
            let updated = page + 1;
            setPage(updated);
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: '/api/authors/' + props.authorId + 'requests',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                params: {
                    page: updated,
                    size: size
                }
            }

            axios
            .get('/api/authors/' + props.authorId + 'requests', config)
            .then((response) => { 
                let more = []
                for (let i = 0; i < size; i++) {
                    more.push(response.data.items[i]);
                }
                setRequests(requests.concat(more));
                if (response.data.items.length < size) {
                    setSeeMore(true);
                } 
            })
            .catch(err => {
                if (err.response.status === 404) {
                    setRequests(requests);
                } else if (err.response.status === 401) {
                    navigate('/unauthorized');
                } else if (err.response.status === 500) {
                    navigate('500 PAGE')
                }
            });
        }
        let updated = page + 2;
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/api/authors/' + props.authorId + 'requests',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            params: {
                page: updated,
                size: size
            }
        }

        axios
        .get('/api/authors/' + props.authorId + 'requests', config)
        .then((response) => { 
            if (response.data.items.length === 0) { setSeeMore(true); }
        })
        .catch(err => {
            if (err.response.status === 404) {
                setRequests(requests);
            } else if (err.response.status === 401) {
                navigate('/unauthorized');
            } else if (err.response.status === 500) {
                navigate('500 PAGE')
            }
        });
    }

    return (
        <div>
            <h4>Friend Requests</h4>
            { requests === undefined || requests.length === 0 ? 
                <div>
                    <h4>No requests.</h4>
                </div> : 
                <div> 
                    <Pagination>
                        {Object.keys(requests).map((request, idx) => (
                            <Request key={idx} {...requests[request]}/>
                        ))}
                        { seeMore ? null : 
                            <div>
                                <Pagination.Item onClick={getMore}>See More</Pagination.Item>
                            </div>
                        }
                    </Pagination>  
                </div>
            }
        </div>
    )
}

export default Requests;
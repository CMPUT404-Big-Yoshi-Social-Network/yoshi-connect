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
import Node from './node.jsx';

function InNodes() {
    const size = 5;
    const navigate = useNavigate();

    const inUrl = '/nodes/incoming';
    const [inNodes, setInNodes] = useState([]);
    const [inPage, setInPage] = useState(1);
    const [inPrev, setInPrev] = useState(true);
    const [inNext, setInNext] = useState(false);

    useEffect(() => {
        /** Incoming */
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: inUrl,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            params: {
                page: 1,
                size: size
            }
        }

        axios
        .get(inUrl, config)
        .then((response) => { 
            if (response.data.items.length !== 0) {
                let nodes = []
                for (let i = 0; i < size; i++) {
                    nodes.push(response.data.items[i]);
                }
                setInNodes(nodes);
            }
        })
        .catch(err => {
            if (err.response.status === 404) {
                console.log('Nothing.')
            } else if (err.response.status === 401) {
                console.log('Unauthorized.')
            } else if (err.response.status === 500) {
               console.log('500 PAGE')
            }
        });

        let updated = 2;
        config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: inUrl,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            params: {
                page: updated,
                size: size
            }
        }

        axios
        .get(inUrl, config)
        .then((response) => { 
            if (response.data.items.length === 0) { setInNext(true); }
        })
        .catch(err => {
            if (err.response.status === 404) {
                console.log('No more.')
            } else if (err.response.status === 401) {
                console.log('Unauthorized.')
            } else if (err.response.status === 500) {
               console.log('500 PAGE')
            }
        });
    }, []);

    const getMore = (url, next, setPage, setNodes, setPrev, setNext, page) => {
        if (!next) {
            let updated = page + 1;
            setPage(updated);
            let config = {
                method: 'get',
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
                let nodes = []
                for (let i = 0; i < size; i++) {
                    nodes.push(response.data.items[i]);
                }
                setNodes(nodes);
                setPrev(false);
                if (response.data.items.length < size) {
                    setNext(true);
                } 
            })
            .catch(err => {
                if (err.response.status === 404) {
                    setNodes([]);
                } else if (err.response.status === 401) {
                    navigate('/unauthorized');
                } else if (err.response.status === 500) {
                    navigate('500 PAGE')
                }
            });
        }
        let updated = page + 2;
        let config = {
            method: 'get',
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
            if (response.data.items.length === 0) { setNext(true); }
        })
        .catch(err => {
            if (err.response.status === 404) {
                setNodes([]);
            } else if (err.response.status === 401) {
                navigate('/unauthorized');
            } else if (err.response.status === 500) {
                navigate('500 PAGE')
            }
        });
    }

    const goBack = (url, prev, setPage, setNodes, setNext, setPrev, page) => {
        if (!prev && prev !== 1) {
            let updated = page - 1;
            setPage(updated);
            let config = {
                method: 'get',
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
                let more = []
                for (let i = 0; i < size; i++) {
                    more.push(response.data.items[i]);
                }
                setNodes(more) 
                setNext(false)
                if (updated === 1) {
                    setPrev(true)
                }
            })
            .catch(err => {
                if (err.response.status === 404) {
                    setNodes([]);
                } else if (err.response.status === 401) {
                    navigate('/unauthorized');
                } else if (err.response.status === 500) {
                    navigate('500 PAGE')
                }
            });
        }
    }

    return (
        <div>
            <h3>Incoming Nodes</h3>
            { inNodes === undefined || inNodes.length === 0 ? 
                <div>
                    <h4>No incoming nodes to show.</h4>
                </div> :
                <div>
                    <Pagination>
                        {Object.keys(inNodes).map((node, idx) => (
                            <Node key={idx} node={inNodes[node]} url={inUrl}/>
                        ))}
                        <Pagination.Prev disabled={inPrev} onClick={goBack(inUrl, inPrev, setInPage, setInNodes, setInNext, setInPrev, inPage)}/>
                        <Pagination.Next disabled={inNext} onClick={getMore(inUrl, inNext, setInPage, setInNodes, setInPrev, setInNext, inPage)}/>
                    </Pagination>
                </div>
            }
        </div>
    )
}

export default InNodes;
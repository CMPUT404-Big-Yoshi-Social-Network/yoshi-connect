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

function OutNodes() {
    const size = 5;
    const navigate = useNavigate();
    const outUrl = '/nodes/outgoing';
    const [outNodes, setOutNodes] = useState([]);
    const [outPage, setOutPage] = useState(1);
    const [outPrev, setOutPrev] = useState(true);
    const [outNext, setOutNext] = useState(false);

    useEffect(() => {
        /** Outgoing */
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: outUrl,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            params: {
                page: 1,
                size: size
            }
        }

        axios
        .get(outUrl, config)
        .then((response) => { 
            if (response.data.items.length !== 0 && outNodes.length === 0) {
                let nodes = []
                for (let i = 0; i < size; i++) {
                    if (response.data.items[i]) {
                        nodes.push(response.data.items[i]);
                    }
                }
                setOutNodes(nodes);
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
            url: outUrl,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            params: {
                page: updated,
                size: size
            }
        }

        axios
        .get(outUrl, config)
        .then((response) => { 
            if (response.data.items.length === 0) { 
                if (!outNext) {
                    setOutNext(true); 
                }
            }
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
    }, [outNodes, outNext]);

    const getMore = () => {
        if (!outNext) {
            let updated = outPage + 1;
            setOutPage(updated);
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: outUrl,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                params: {
                    page: updated,
                    size: size
                }
            }

            axios
            .get(outUrl, config)
            .then((response) => { 
                let nodes = []
                for (let i = 0; i < size; i++) {
                    nodes.push(response.data.items[i]);
                }
                setOutNodes(nodes);
                setOutPrev(false);
                if (response.data.items.length < size) {
                    setOutNext(true);
                } 
            })
            .catch(err => {
                if (err.response.status === 404) {
                    setOutNodes([]);
                } else if (err.response.status === 401) {
                    navigate('/unauthorized');
                } else if (err.response.status === 500) {
                    navigate('500 PAGE')
                }
            });
        }
        let updated = outPage + 2;
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: outUrl,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            params: {
                page: updated,
                size: size
            }
        }

        axios
        .get(outUrl, config)
        .then((response) => { 
            if (response.data.items.length === 0) { setOutNext(true); }
        })
        .catch(err => {
            if (err.response.status === 404) {
                setOutNodes([]);
            } else if (err.response.status === 401) {
                navigate('/unauthorized');
            } else if (err.response.status === 500) {
                navigate('500 PAGE')
            }
        });
    }

    const goBack = () => {
        if (!outPrev && outPage !== 1) {
            let updated = outPage - 1;
            setOutPage(updated);
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: outUrl,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                params: {
                    page: updated,
                    size: size
                }
            }
    
            axios
            .get(outUrl, config)
            .then((response) => { 
                let more = []
                for (let i = 0; i < size; i++) {
                    more.push(response.data.items[i]);
                }
                setOutNodes(more) 
                setOutNext(false)
                if (updated === 1) {
                    setOutPrev(true)
                }
            })
            .catch(err => {
                if (err.response.status === 404) {
                    setOutNodes([]);
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
            <h3>Outgoing Nodes</h3>
            { outNodes === undefined || outNodes.length === 0 ? 
                <div>
                    <h4>No outgoing nodes to show.</h4>
                </div> :
                <div>
                    <Pagination>
                        {Object.keys(outNodes).map((node, idx) => (
                            <Node key={idx} node={outNodes[node]} url={outUrl}/>
                        ))}
                        <Pagination.Prev disabled={outPrev} onClick={goBack}/>
                        <Pagination.Next disabled={outNext} onClick={getMore}/>
                    </Pagination>
                </div>
            }
        </div>
    )
}

export default OutNodes;
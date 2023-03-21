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
import React, { useState } from 'react';
import Popup from 'reactjs-popup';

// User Interface
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Form } from 'react-bootstrap';
import Notifications from '../../notifications/notifcation-box';
import './nav.css'
import { useNavigate } from 'react-router-dom';
import SearchCard from './search.jsx';
import axios from 'axios';
import Pagination from 'react-bootstrap/Pagination';

function TopNav(props) {
    const [searchOutcomes, setSearchOutcomes] = useState(false);
    const [authors, setAuthors] = useState([]);
    const [page, setPage] = useState(1);
    const size = 5;
    const url = '/authors/';
    const navigate = useNavigate();
    const [prev, setPrev] = useState(true);
    const [next, setNext] = useState(false);
    const [newAuthor, setNewAuthor] = useState({newSearch: ''})

    const start = () => {
        setSearchOutcomes(true);

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: url + newAuthor.newSearch,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            params: {
                page: page,
                size: size
            }
        }

        axios
        .get(url + newAuthor.newSearch, config)
        .then((response) => { 
            if (response.data.items.length !== 0 && authors.length === 0) {
                let authors = []
                for (let i = 0; i < size; i++) {
                    authors.push(response.data.items[i]);
                }
                setAuthors(authors);
            }
        })
        .catch(err => {
            if (err.response.status === 404) {
                setAuthors([]);
            } else if (err.response.status === 401) {
                navigate('/unauthorized');
            } else if (err.response.status === 500) {
                navigate('500 PAGE')
            }
        });

        let updated = page + 1;
        config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: url + newAuthor.newSearch,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            params: {
                page: updated,
                size: size
            }
        }

        axios
        .get(url + newAuthor.newSearch, config)
        .then((response) => { 
            if (response.data.items.length === 0) { 
                if (!next) {
                    setNext(true); 
                }
            }
        })
        .catch(err => {
            if (err.response.status === 404) {
                if (authors === undefined || authors.length === 0) {
                    setAuthors([]);
                } else {
                    setAuthors(authors);
                }
            } else if (err.response.status === 401) {
                navigate('/unauthorized');
            } else if (err.response.status === 500) {
                navigate('500 PAGE')
            }
        });
    }

    const getMore = () => {
        if (!next) {
            let updated = page + 1;
            setPage(updated);
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: url + newAuthor.newSearch,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                params: {
                    page: updated,
                    size: size
                }
            }

            axios
            .get(url + newAuthor.newSearch, config)
            .then((response) => { 
                let authors = []
                for (let i = 0; i < size; i++) {
                    authors.push(response.data.items[i]);
                }
                setAuthors(authors);
                setPrev(false);
                if (response.data.items.length < size) {
                    setNext(true);
                } 
            })
            .catch(err => {
                if (err.response.status === 404) {
                    setAuthors([]);
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
            url: url + newAuthor.newSearch,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            params: {
                page: updated,
                size: size
            }
        }

        axios
        .get(url + newAuthor.newSearch, config)
        .then((response) => { 
            if (response.data.items.length === 0) { setNext(true); }
        })
        .catch(err => {
            if (err.response.status === 404) {
                setAuthors([]);
            } else if (err.response.status === 401) {
                navigate('/unauthorized');
            } else if (err.response.status === 500) {
                navigate('500 PAGE')
            }
        });
    }

    const goBack = () => {
        if (!prev && prev !== 1) {
            let updated = page - 1;
            setPage(updated);
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: url + newAuthor.newSearch,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                params: {
                    page: updated,
                    size: size
                }
            }
    
            axios
            .get(url + newAuthor.newSearch, config)
            .then((response) => { 
                let more = []
                for (let i = 0; i < size; i++) {
                    more.push(response.data.items[i]);
                }
                setAuthors(more) 
                setNext(false)
                if (updated === 1) {
                    setPrev(true)
                }
            })
            .catch(err => {
                if (err.response.status === 404) {
                    setAuthors([]);
                } else if (err.response.status === 401) {
                    navigate('/unauthorized');
                } else if (err.response.status === 500) {
                    navigate('500 PAGE')
                }
            });
        }
    }

    return (
        <Navbar className='topNav'>
            <Navbar.Brand className='topNavBrand' href='/feed'>
                <img className='topLogo' src='/images/yoshi_connect_logo2.png' width={40} height={40} alt='logo'/>
                <h1>Yoshi Connect</h1>
            </Navbar.Brand>
            <Nav className='topNavSearch'>
                <Form.Control type="search" placeholder="Search" className="topSearch" onChange={(e) => {setNewAuthor({...newAuthor, newSearch: e.target.value})}}/>
                { searchOutcomes ? 
                        <Popup trigger={<button onClick={start}>Search</button>} position="right center">
                            {Object.keys(authors).map((author, idx) => (
                                <SearchCard key={idx} {...authors[author]}/>
                            ))}
                            <Pagination>
                                <Pagination.Prev disabled={prev} onClick={goBack}/>
                                <Pagination.Next disabled={next} onClick={getMore}/>
                            </Pagination>
                        </Popup> 
                    :
                    null
                }

            </Nav>
            <Nav className='topNavNotif'>
                <Popup  className='notifPopup' trigger={<img className='notifBell' src='/images/public/icon_notif_bell.png' alt='Notifications' width={30}/>}>
                    <Notifications authorId={props.authorId}/>
                </Popup>
            </Nav>
        </Navbar>
    )
}

export default TopNav;


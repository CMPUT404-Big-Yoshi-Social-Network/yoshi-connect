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
// import { useParams } from 'react-router-dom';
import React from 'react';
import { useParams } from 'react-router-dom';

// Child Component
import Following from '../../follows/following.jsx';
import Friends from '../../friends/friends.jsx';
import MessagesNav from '../../messages/messagesNav.jsx';
import SettingsNav from '../../settings/nav.jsx';

// User Interface
import './nav.css';

function LeftNavBar(props) {
    /**
     * Description: Represents the left dynamic navigation bar 
     * Functions: N/A
     * Returns: N/A
     */
    const url = window.location.pathname;
    const { username } = useParams();
    let url1 = ''
    if (username) {
        url1 = '/users/' + username
    }
    return (
        <div>
        { url === '/' || url === '/github' || url.split('/authors/').length === 2 ? 
            null :
            <div className='left-column'>
                { url === '/feed' || url === url1 ? <Following authorId={props.authorId}/> :
                    url === '/friends' ? <Friends authorId={props.authorId}/> : 
                    url === '/settings' ? <SettingsNav/> : 
                    url === '/messages' ? <MessagesNav authorId={props.authorId} messengers={props.messengers} currentMessenger={props.currentMessenger} setCurrentMessenger={props.setCurrentMessenger}/> : null
                }
            </div>
        }

        </div>
    )
}

export default LeftNavBar;
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
import { Button } from 'react-bootstrap';

// Child Component 
import Messenger from './messenger.jsx';

function MessagesNav({authorId, messengers, currentMessenger, setCurrentMessenger}) {
    const selectedMessenger = (messenger) => { 
        setCurrentMessenger(messenger.url)
    }
    return (
        <div style={{fontFamily: 'Signika', paddingLeft:'1em'}}>
            <h3>Messages</h3>
            { messengers === undefined || messengers.length === 0 ? null :
                <div>
                    {Object.keys(messengers).map((messenger, idx) => (
                        <Button key={idx} onClick={() => selectedMessenger(messengers[messenger])}><Messenger key={idx} authorId={authorId} messenger={messengers[messenger]} currentMessenger={currentMessenger}/></Button>
                    ))}
                </div>
            }
        </div>
    )
}

export default MessagesNav;
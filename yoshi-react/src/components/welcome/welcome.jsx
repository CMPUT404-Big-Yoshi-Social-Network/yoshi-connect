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
import React from 'react';

// User Interface
import {Button, Container, Image} from 'react-bootstrap';
import './welcome.css'

function Welcome() {
    /**
     * Description: Represents Welcome screen that routes to the Signup and Login page 
     * Returns: N/A
     */
    console.log('Debug: <TLDR what the function is doing>')
    return (
        <div className='welcome'>
            <Image fluid src='/images/yoshi_connect_logo2.png' alt='Logo' width={100} />
            <Container className='welcome-hello'>
                Please Log In or Sign Up to Continue.
            </Container>
            <div>
                <Button className='welcome-button' href='/signup' data-testid="signup">Sign Up</Button>
                <Button className='welcome-button' href='/login' data-testid="login">Log In</Button>
            </div>
        </div>
    )
}

export default Welcome;
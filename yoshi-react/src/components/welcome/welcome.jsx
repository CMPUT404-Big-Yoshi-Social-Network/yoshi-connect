import React from 'react';
import {Button, Container, Image} from 'react-bootstrap';
import './welcome.css'

function Welcome() {
    return (
        <body>
            <Image fluid src='/images/yoshi_connect_logo2.png' alt='Logo' width={100} />
            <Container className='hello'>
                Welcome to Yoshi Connect.
            </Container>
            <Button className='button' href='/signup'>Sign Up</Button>
            <Button className='button' href='/login'>Log In</Button>
        </body>
    )
}

export default Welcome;
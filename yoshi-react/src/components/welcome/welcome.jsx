import React from 'react';
import {Button, Container, Image} from 'react-bootstrap';
import './welcome.css'

function Welcome() {
    return (
        <div className='welcome'>
            <Image fluid src='/images/yoshi_connect_logo2.png' alt='Logo' width={100} />
            <Container className='welcome-hello'>
                Welcome to Yoshi Connect.
            </Container>
            <div data-testid="signup">
                <Button className='welcome-button' href='/signup'>Sign Up</Button>
                <Button className='welcome-button' href='/login'>Log In</Button>
            </div>
            
        </div>
    )
}

export default Welcome;
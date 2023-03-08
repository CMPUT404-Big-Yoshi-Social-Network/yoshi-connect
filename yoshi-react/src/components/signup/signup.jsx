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
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// User Interface
import { Form, Card, Button, Container, Image } from 'react-bootstrap';
import './signup.css';

export default function Signup() {
  /**
   * Description:
   * Functions: 
   *     - getAccount(): Sends a POST request to get the account for routing it to the public feed as well as saving the new author
   * Returns: N/A
   */
  const navigate = useNavigate();
  const [data, setData] = useState({ username: '', email: '', password: '' })
  const url = '/api/signup';

  const getAccount = async (e) => {
    /**
     * Description: Sends a POST request to get an account for public feed and saving the account into the database
     * Request: POST
     * Returns: N/A
     */
    e.preventDefault()
  
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: url,
      headers: {
        'Content-Type': 'application/json',
        'Last-Modified': new Date(),
      },
      data: data
    }

    axios
    .post(url, config)
    .then((response) => {
      console.log("Debug: Going to public feed.");
      navigate('/feed');
    })
    .catch(err => { console.error(err); });
  }

  return(
    <div className='signup'>
      <Image fluid src='/images/yoshi_connect_logo2.png' alt='Logo' width={100} />
      <Container className='signup-hello'>
          Yoshi Connect
      </Container>
      <Card className="signup-card">
        <Card.Header>
            <h3>Sign Up</h3>
        </Card.Header>
        <Card.Body>
            <Form className='signup-form'>
            <Form.Group className="signup-a">
                  <p>Email</p>
                    <Form.Control
                        name="email"
                        onChange={(e) => {setData({...data, email: e.target.value})}}
                        type="email" className='signup-box'/>
                </Form.Group>
                <Form.Group className="signup-a">
                  <p>Username</p>
                    <Form.Control
                        name="username"
                        onChange={(e) => {setData({...data, username: e.target.value})}}
                        type="text" className='signup-box'/>
                </Form.Group>
                <Form.Group className="signup-a">
                  <p>Password</p>
                    <Form.Control
                        name="password"
                        onChange={(e) => {setData({...data, password: e.target.value})}}
                        type="password" className='signup-box'/>
                </Form.Group>
                <br></br>
                <Button href='/' variant="warning" type="submit" className='signup-button'>Back</Button>
                <Button onClick={getAccount} variant="warning" type="submit" className='signup-button'>Next</Button>
            </Form>
        </Card.Body>
      </Card>
    </div>
  )
  }
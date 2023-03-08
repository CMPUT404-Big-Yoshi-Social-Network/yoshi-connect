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
import {Button, Container, Image, Card, Form} from 'react-bootstrap';
import './login.css'

export default function Login() {
    /**
     * Description:
     * Functions: 
     *     - getUserpass(): Sends a POST request to get the account for routing it to the public feed as well as loggin in the existing author
     * Returns: N/A
     */
    const navigate = useNavigate();
    const [data, setData] = useState({
      username: '',
      password: ''
    })
    const getUserpass = (e) => {
      /**
       * Description: Sends a POST request to get the author's account for public feed from the database
       * Request: POST
       * Returns: N/A
       */
      e.preventDefault()

      let justLogged =  new Date();

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: '/server/login',
        headers: {
          'Content-Type': 'application/json',
          'Last-Modified': justLogged
        },
        data: data
      }

      axios(config)
      .then((response) => {
        if (response.data.status) {
          console.log("Debug: SessionId saved locally.");
          localStorage['sessionId'] = response.data.sessionId;

          console.log("Debug: Going to public feed.")
          navigate('/feed');
        }
      })
    }
    return(
      <div className='login'>
        <Image fluid src='/images/yoshi_connect_logo2.png' alt='Logo' width={100} />
        <Container className='login-hello'>
            Yoshi Connect
        </Container>
        <Card className="login-card">
          <Card.Header>
              <h3>Log In</h3>
          </Card.Header>
          <Card.Body>
              <Form className='form'>
                  <Form.Group className="login-text">
                    <p>Username</p>
                      <Form.Control
                          name="username"
                          onChange={(e) => {setData({...data, username: e.target.value})}}
                          type="text" className='login-box'/>
                  </Form.Group>
                  <Form.Group className="login-text">
                    <p>Password</p>
                      <Form.Control
                          name="password"
                          onChange={(e) => {setData({...data, password: e.target.value})}}
                          type="password" className='login-box'/>
                  </Form.Group>
                  <br></br>
                  <Button href='/' variant="warning" type="submit" className='login-button'>Back</Button>
                  <Button onClick={getUserpass} variant="warning" type="submit" className='login-button'>Next</Button>
              </Form>
          </Card.Body>
        </Card>
      </div>
            
    )
  }
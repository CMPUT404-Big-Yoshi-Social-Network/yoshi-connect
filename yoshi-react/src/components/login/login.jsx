import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {Button, Container, Image, Card, Form} from 'react-bootstrap';
import './login.css'

export default function Login() {
    const navigate = useNavigate();
    const [data, setData] = useState({
      username: '',
      password: ''
    })
    const getUserpass = (e) => {
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
        if ( response.data.status === 'Successful' ) {
          console.log("Debug: Token received.");
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
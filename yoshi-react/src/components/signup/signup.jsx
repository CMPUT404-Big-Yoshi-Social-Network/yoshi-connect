import axios from 'axios';
import { useState } from 'react';
import { Form, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './signup.css';

export default function Signup() {
    const navigate = useNavigate();
    const [data, setData] = useState({
      username: '',
      email: '',
      password: ''
    })

    const checkUsernameInUse = async (username) => {
      let justLogged =  new Date();

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: '/server/signup',
        headers: {
          'Content-Type': 'application/json',
          'Last-Modified': justLogged,
        },
        data: {
          username: username,
          status: 'Is username in use'
        }
      }

      const username_free = await axios(config)
      .then((response) => {
        if ( response.data.status === 'Successful' ) {
          console.log("Debug: Going to public feed.")
          return true;
        } else {
          return false;
        }
      })
      .catch(err => {
        console.error(err);
      }); 
      return username_free
    }
    
    const getAccount = async (e) => {
      e.preventDefault()
      let a = await checkUsernameInUse(data.username);
      if (a) {
        let justLogged =  new Date();

        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: '/server/signup',
          headers: {
            'Content-Type': 'application/json',
            'Last-Modified': justLogged,
          },
          data: data
        }

        axios(config)
        .then((response) => {
          console.log("Debug: Token received.");
          if ( response.data.status === 'Successful' ) {
            console.log("Debug: Going to public feed.")
            window.localStorage.setItem("token", response.data.token);
            navigate('/feed');
          }
        })
        .catch(err => {
          console.error(err);
        });
      }
    }
    return(
      <body>
        <Card className="card">
          <Card.Header>
              <h4>Sign Up</h4>
          </Card.Header>
          <Card.Body>
              <Form>
                  <Form.Group className="mb-3">
                    <p>Username</p>
                      <Form.Control
                          name="username"
                          onChange={(e) => {setData({...data, username: e.target.value})}}
                          type="text" placeholder="Username"/>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <p>Email</p>
                      <Form.Control
                          name="email"
                          onChange={(e) => {setData({...data, username: e.target.value})}}
                          type="email" placeholder="Email"/>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <p>Password</p>
                      <Form.Control
                          name="password"
                          onChange={(e) => {setData({...data, username: e.target.value})}}
                          type="password" placeholder="Password"/>
                  </Form.Group>
                  <Form.Group className="mb-3">
                      <Button onClick={getAccount} variant="warning" type="submit">Create Account</Button>
                  </Form.Group>
              </Form>
          </Card.Body>
        </Card>
      </body>
      
    )
  }
import axios from 'axios';
import { useState } from 'react';
import { Form, Card, Button, Container, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './signup.css';

export default function Signup() {
    const navigate = useNavigate();
    const [data, setData] = useState({
      username: '',
      email: '',
      password: ''
    })

    const getAccount = async (e) => {
      e.preventDefault()
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
            console.log("Debug: SessionId saved locally.");
            window.localStorage.setItem('sessionId', response.data.sessionId);
            console.log("Debug: Going to public feed.");
            navigate('/feed');
          }
        })
        .catch(err => {
          console.error(err);
        });
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
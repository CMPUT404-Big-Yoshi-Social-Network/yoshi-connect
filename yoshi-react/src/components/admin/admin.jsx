import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import '../login/login.css';

export default function AdminLogin() { 
    const navigate = useNavigate();
    const [data, setData] = useState({
      username: '',
      password: ''
    })
    const getAdmin = (e) => {
      e.preventDefault()

      let justLogged =  new Date();

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: '/server/admin',
        headers: {
          'Content-Type': 'application/json',
          'Last-Modified': justLogged
        },
        data: data
      }

      axios(config)
      .then((response) => {
        if ( response.data.status === 'Successful') {
          console.log("Debug: Token saved and going to dashboard.")
          return navigate('/admin/dashboard/');
        } 
      })
    }
    return(
      <div className='login'>
        <form>
          <h1>Admin</h1>
        <label>
          <p>Username</p>
        </label>
          <input type="text" name="username" className='login-box' onChange={(e) => {
            setData({
              ...data,
              username: e.target.value
            })
          }}/>
        <label>
          <p>Password</p>
        </label>
          <input type="password" name="password" className='login-box' onChange={(e) => {
            setData({
              ...data,
              password: e.target.value
            })
          }}/>
        <div>
          <br/>
          <Button onClick={getAdmin} variant="warning" type="submit" className='login-button'>Next</Button>
          {/* <button type="submit" onClick={getAdmin}>Submit</button> */}
        </div>
      </form>
      </div>
      
    )
  }
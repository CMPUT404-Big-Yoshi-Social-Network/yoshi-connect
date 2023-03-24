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
import { Button } from 'react-bootstrap';
import '../login/login.css';

export default function AdminLogin() { 
    const url = '/admin';
    const navigate = useNavigate();
    const [data, setData] = useState({ username: '', password: '' })
    const [error, setError] = useState(false);

    const getAdmin = (e) => {
      e.preventDefault()

      if (data.username.length === 0 || data.password.length === 0){
        setError(true)
      }

      let justLogged =  new Date();

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: url,
        headers: {
          'Content-Type': 'application/json',
          'Last-Modified': justLogged
        },
        data: data
      }

      axios(config)
      .then((response) => { navigate('/admin/dashboard/'); })
      .catch(err => {
        if (err.response.status === 400) {
          setError(true);
        } else if (err.response.status === 500) {
          navigate('/servererror');
        } else if (err.response.status === 403) {
          navigate('/forbidden');
        }
      });
    }
    return(
      <div className='login'>
        <form>
          <h1>Admin</h1>
          {error? <p className='login-error'>Username or password is incorrect</p>:""}
        <label>
          <p>Username</p>
        </label>
          <input type="text" name="username" className='login-box' onChange={(e) => {
            setData({
              ...data,
              username: e.target.value
            })
          }}/>
          {error&&data.username.length<=0? <p className='login-error'>Username cannot be empty</p>:""}
        <label>
          <p>Password</p>
        </label>
          <input type="password" name="password" className='login-box' onChange={(e) => {
            setData({
              ...data,
              password: e.target.value
            })
          }}/>
          {error&&data.password.length<=0? <p className='login-error'>Password cannot be empty</p>:""}
        <div>
          <br/>
          <Button onClick={getAdmin} variant="warning" type="submit" className='login-button'>Next</Button>
          {/* <button type="submit" onClick={getAdmin}>Submit</button> */}
        </div>
      </form>
      </div>
      
    )
  }
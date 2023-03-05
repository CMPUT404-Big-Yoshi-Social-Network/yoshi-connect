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

import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup() {
    const navigate = useNavigate();

    const url = '/server/signup';
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
        url: url,
        headers: {
          'Content-Type': 'application/json',
          'Last-Modified': justLogged,
        },
        data: {
          username: username,
          status: 'Is username in use'
        }
      }

      const usernameFree = await axios(config)
      .then((response) => {
        if (response.data.status) {
          console.log("Debug: Going to public feed.")
          return true;
        } else {
          return false;
        }
      })
      .catch(err => {
        console.error(err);
      }); 
      return usernameFree
    }
    
    const getAccount = async (e) => {
      e.preventDefault()

      let usernameFree = await checkUsernameInUse(data.username);
      if (usernameFree) {
        let justLogged =  new Date();


        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: url,
          headers: {
            'Content-Type': 'application/json',
            'Last-Modified': justLogged,
          },
          data: data
        }

        axios(config)
        .then((response) => {
          console.log("Debug: Token received.");
          if (response.data.status) {
            console.log("Debug: SessionId saved locally.");
            window.localStorage.setItem('sessionId', response.data.sessionId);
            console.log("Debug: Going to public feed.");
            navigate('/feed');
          }
        })
        .catch(err => {
          if (err.response.status === 400) {
            console.log("Debug: Username in use, or you did not fill all the cells.");
            navigate('/notfound'); 
          }
        });
      }
    }
    return(
      <div>
        <form>
          <label>
            <p>Username</p>
          </label>
            <input type="text" name="username" onChange={(e) => {
              setData({
                ...data,
                username: e.target.value
              })
            }}/>
          <label>
            <p>Email</p>
          </label>

            <input type="email" name="email" onChange={(e) => {
              setData({
                ...data,
                email: e.target.value
              })
            }}/>
          <label>
            <p>Password</p>
          </label>

            <input type="password" name="password" onChange={(e) => {
              setData({
                ...data,
                password: e.target.value
              })
            }}/>
          <div>

            <button type="submit" onClick={getAccount}>Create Account</button>
          </div>
        </form>
      </div>
    )
}

export default Signup;
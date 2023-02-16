import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
export default function Signup() {
    const navigate = useNavigate();
    const [data, setData] = useState({
      username: '',
      email: '',
      password: ''
    })

    const justLogged = new Date();
    const checkUsernameInUse = (username) => {
      let justLogged =  new Date();

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: '/signup',
        headers: {
          'Content-Type': 'application/json',
          'Last-Modified': justLogged,
        },
        data: {
          username: username,
          status: 'Is username in use'
        }
      }

      axios(config)
      .then((response) => {
        if ( response.data.status === 'Successful' ) {
          console.log("Debug: Going to public feed.")
          navigate('/feed');
          return true;
        } else {
          return false;
        }
      })
      .catch(err => {
        console.error(err);
      }); 
    }
    
    const getAccount = (e) => {
      e.preventDefault()

      if (checkUsernameInUse(data.username)) {
        let justLogged =  new Date();

        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: '/signup',
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
      } else {
        alert("Username is already in use. Try again.");
      }
    }
    return(
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
    )
  }
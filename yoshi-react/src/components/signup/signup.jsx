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
    const getAccount = (e) => {
      e.preventDefault()

      let justLogged =  new Date();
      let expiresAt = new Date(justLogged.getTime() + (1440 * 60 * 1000)); // 24 hours (1440 minutes)

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: '/login',
        headers: {
          'Content-Type': 'application/json',
          'Last-Modified': justLogged,
          'Expires': expiresAt
        },
        data: data
      }

      axios
      .post('/signup', config)
      .then((response) => {
        console.log("Debug: Token received.");
        console.log(response)
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
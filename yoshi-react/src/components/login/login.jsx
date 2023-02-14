import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
export default function Login() {
    const navigate = useNavigate();
    const [data, setData] = useState({
      username: '',
      password: ''
    })
    const getUserpass = (e) => {
      e.preventDefault()

      let justLogged =  new Date();
      let expiresAt = new Date(justLogged.getTime() + (1440 * 60 * 1000)); // 24 hours (1440 minutes)

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: '/login',
        headers: {
          'Content-Type': 'application/json',
          'Date': justLogged,
          'Expires': expiresAt
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
        } else {
          alert("You are not an author! Get outta here!")
        }
      })
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
          <p>Password</p>
        </label>

          <input type="password" name="password" onChange={(e) => {
            setData({
              ...data,
              password: e.target.value
            })
          }}/>
        <div>
          <button type="submit" onClick={getUserpass}>Submit</button>
        </div>
      </form>
    )
  }
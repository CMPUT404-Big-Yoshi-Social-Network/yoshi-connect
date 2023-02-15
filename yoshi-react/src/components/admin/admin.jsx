import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
export default function AdminLogin() { 
    const navigate = useNavigate();
    const [data, setData] = useState({
      username: '',
      password: ''
    })
    const getAdmin = (e) => {
      e.preventDefault()

      let justLogged =  new Date();
      let expiresAt = new Date(justLogged.getTime() + (1440 * 60 * 1000)); // 24 hours (1440 minutes)

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: '/admin',
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
        if ( response.data.admin ) {
          console.log("Debug: Going to dashboard.")
          window.localStorage.setItem("token", response.data.token);
          window.localStorage.setItem("admin", response.data.admin);
          navigate('/admin/dashboard');
        } else {
          alert("You are not an admin! Get outta here!")
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
          <button type="submit" onClick={getAdmin}>Submit</button>
        </div>
      </form>
    )
  }
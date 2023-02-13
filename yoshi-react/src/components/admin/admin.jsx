// TODO: CHANGE THIS PLEASE
import axios from 'axios';
import { useState } from 'react';
export default function AdminLogin() { 
    const [data, setData] = useState({
      username: '',
      password: ''
    })
    const getAdmin = (e) => {
      e.preventDefault()

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: '/admin',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
      }

      axios(config)
      .then((response) => {
        console.log("Debug: Token received.");
        // Local Storage 
        window.localStorage.setItem("token", response.data.token);
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
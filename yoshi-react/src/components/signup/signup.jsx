// TODO: CHANGE THIS PLEASE
import axios from 'axios';
import { useState } from 'react';
export default function Signup() {
    const [data, setData] = useState({
      username: '',
      email: '',
      password: ''
    })
    const getAccount = (e) => {
      e.preventDefault()

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: '/login',
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
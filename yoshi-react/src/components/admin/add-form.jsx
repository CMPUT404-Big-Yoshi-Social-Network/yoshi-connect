import React from "react";
import axios from 'axios';
import { useState } from 'react';

function AddAuthor() {
    const [data, setData] = useState({
        username: '',
        password: '',
        email: ''
      })

      const checkUsernameInUse = async (username) => {
        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: '/server/admin/dashboard',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            username: username,
            status: 'Is username in use'
          }
        }
  
        const username_free = await axios(config)
        .then((response) => {
          if ( response.data.status === 'Successful' ) {
            return true;
          } else {
            return false;
          }
        })
        .catch(err => {
          console.error(err);
        }); 
        return username_free
      }

    const addAuthor = async (e) => {
        e.preventDefault();
        let notUsed = await checkUsernameInUse(data.username);
        console.log('Debug: Attempting to add an author');
        if (notUsed) {
            let config = {
                method: 'put',
                maxBodyLength: Infinity,
                url: '/server/admin/dashboard',
                headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                },
                data: {
                    status: 'Add New Author',
                    username: data.username,
                    password: data.password,
                    email: data.email,
                    admin: false
                }
            }

            axios
            .put('/server/admin/dashboard', config)
            .then((response) => {
            })
            .catch(err => {
                console.error(err);
            });
        } else {
            console.log('Debug: Username is already taken.')
        }
    }
    
    return (
        <div id='add'>
            <form method='PUT'>
                <label>
                    Username:
                    <input type="username" name="username" onChange={(e) => {
                        setData({
                        ...data,
                        username: e.target.value
                        })
                    }}/>
                </label>
                <label>
                    Password:
                    <input type="password" name="password" onChange={(e) => {
                        setData({
                        ...data,
                        password: e.target.value
                        })
                    }}/>
                </label>
                <label>
                    Email:
                    <input type="email" name="email" onChange={(e) => {
                        setData({
                        ...data,
                        email: e.target.value
                        })
                    }}/>
                </label>
                <button type="submit" onClick={addAuthor}>Create Author</button>
            </form>
        </div>
    )
}

export default AddAuthor;
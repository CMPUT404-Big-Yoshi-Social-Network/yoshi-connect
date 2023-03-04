import React from "react";
import axios from 'axios';
import { useState } from 'react';

function AddAuthor() {
    const url = '/server/admin/dashboard';
    const [data, setData] = useState({
        username: '',
        password: '',
        email: ''
      })

    const addAuthor = async (e) => {
        e.preventDefault();
        console.log('Debug: Attempting to add an author.');
        let config = {
            method: 'put',
            maxBodyLength: Infinity,
            url: url,
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
        .put(url, config)
        .then((response) => {})
        .catch(err => {
            console.error(err);
        });
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
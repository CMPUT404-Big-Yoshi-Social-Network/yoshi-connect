import React from "react";
import { useState } from 'react';
import axios from 'axios';

function ModifyAuthor(props) {
    const [data, setData] = useState({
        newUsername: props.username,
        newPassword: props.password,
        newEmail: props.email,
        newAbout: props.about,
        newPronouns: props.pronouns,
        newAdmin: props.admin
    })

    const modify = (e) => {
        e.preventDefault();
        console.log('Debug: Attempting to modify an author');
        let config = {
            method: 'put',
            maxBodyLength: Infinity,
            url: '/server/admin/dashboard',
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: {
                status: 'Modify an Author',
                newUsername: data.newUsername,
                newPassword: data.newPassword,
                newEmail: data.newEmail,
                newAbout: data.newAbout,
                newPronouns: data.newPronouns,
                newAdmin: data.newAdmin,
                authorId: props._id
            }
        }

        axios
        .put('/server/admin/dashboard', config)
        .then((response) => {
        })
        .catch(err => {
            console.error(err);
        });
    }

    return (
        <div id='modify'>
            <form>
                <label>
                    Username:
                    <input type="username" name="username" value={data.newUsername} onChange={(e) => {
                        setData({
                        ...data,
                        newUsername: e.target.value
                        })
                    }}/>
                </label>
                <br></br>
                <label>
                    Password:
                    <input type="text" name="password" onChange={(e) => {
                        setData({
                        ...data,
                        newPassword: e.target.value
                        })
                    }}/>
                </label>
                <br></br>
                <label>
                    Email:
                    <input type="email" name="email" value={data.newEmail} onChange={(e) => {
                        setData({
                        ...data,
                        newEmail: e.target.value
                        })
                    }}/>
                </label>
                <br></br>
                <label>
                    About:
                    <input type="about" name="about" value={data.newAbout} onChange={(e) => {
                        setData({
                        ...data,
                        newAbout: e.target.value
                        })
                    }}/>
                </label>
                <br></br>
                <label>
                    Pronouns:
                    <input type="pronouns" name="pronouns" value={data.newPronouns} onChange={(e) => {
                        setData({
                        ...data,
                        newPronouns: e.target.value
                        })
                    }}/>
                </label>
                <br></br>
                <label>
                    Admin:
                    <input type="admin" name="admin" value={data.newAdmin} onChange={(e) => {
                        setData({
                        ...data,
                        newAdmin: e.target.value
                        })
                    }}/>
                </label>
                <br></br>
                <button type="submit" onClick={modify}>Update Author</button>
            </form>
        </div>
    )
}

export default ModifyAuthor;
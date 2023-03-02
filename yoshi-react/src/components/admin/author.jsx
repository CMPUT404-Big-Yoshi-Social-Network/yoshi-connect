import React from "react";
import axios from 'axios';
import { useState } from 'react';
import ModifyAuthor from "./modify-form.jsx";

function Author(props) {
    const { username } = props;
    const [show, setShow] = useState({
        modify: null
    })
    const modifyAuthor = () => {
        console.log('Debug: Modifying this author')
        const show = true;
        setShow(prevShow => ({...prevShow, show}));
    }
    const deleteAuthor = () => {
        console.log('Debug: Deleting this author')
        let config = {
            method: 'delete',
            maxBodyLength: Infinity,
            url: '/server/admin/dashboard',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                username: username,
                status: 'Delete an Author'
            }
        }
        axios
        .delete('/server/admin/dashboard', config)
        .then((response) => {
        })
        .catch(err => {
            console.error(err);
        });
    }
    return (
        <div id='author'>
            { username }
            <button type="button" id='modify' onClick={() => modifyAuthor()}>Modify</button>
            <button type="button" id='delete' onClick={() => deleteAuthor()}>Delete</button>
            { show.modify ? <div><ModifyAuthor/></div> : null }
        </div>
    )
}

export default Author;
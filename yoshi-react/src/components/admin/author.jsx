import React, { useEffect } from "react";
import axios from 'axios';
import ModifyAuthor from "./modifyForm.jsx";
import Popup from 'reactjs-popup';
import { useState } from 'react';

function Author(props) {
    const [username, setUsername] = useState('');
    const url = '/server/admin/dashboard';
    useEffect(() => {
        setUsername(props.username)
     }, [props]);
    const deleteAuthor = () => {
        console.log('Debug: Deleting this author')
        let config = {
            method: 'delete',
            maxBodyLength: Infinity,
            url: url,
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                username: username,
                status: 'Delete an Author'
            }
        }
        axios
        .delete(url, config)
        .then((response) => {
        })
        .catch(err => {
            console.error(err);
        });
    }
    return (
        <div id='author'>
            { props.username }
            <button type="button" id='delete' onClick={() => deleteAuthor()}>Delete</button>
            <Popup trigger={<button>Modify</button>} position="right center">
                <ModifyAuthor {...props}/>
            </Popup>
        </div>
    )
}

export default Author;
import React from "react";
import axios from 'axios';

function Author(props) {
    const { username } = props;
    const modifyAuthor = () => {
        console.log('Debug: Modifying this author')
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
        </div>
    )
}

export default Author;
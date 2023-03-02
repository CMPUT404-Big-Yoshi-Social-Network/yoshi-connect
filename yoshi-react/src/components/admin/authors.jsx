import axios from 'axios';
import React, { useEffect, useState } from "react";
import Author from './author.jsx';

function Authors() {
    const [authors, setAuthors] = useState([]);
    useEffect(() => {
        console.log('Debug: Fetching all the authors')
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/server/server/admin/dashboard',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                status: 'Fetching Authors'
            }
        }
        axios
        .post('/server/server/admin/dashboard', config)
        .then((response) => {
            setAuthors(response.data.authors)
        })
        .catch(err => {
            console.error(err);
        });
    }, [setAuthors]);
    return (
        <div>
            <h3>Authors</h3>
            {Object.keys(authors).map((author, idx) => (
                <Author key={idx} {...authors[author]}/>
            ))}
        </div>
    )
}

export default Authors;
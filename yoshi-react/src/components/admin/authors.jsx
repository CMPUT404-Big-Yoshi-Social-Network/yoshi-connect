import axios from 'axios';
import React, { useEffect, useState } from "react";
import Author from './author.jsx';

function Authors() {
    const [authors, setAuthors] = useState([]);
    const url = '/server/admin/dashboard';
    useEffect(() => {
        console.log('Debug: Fetching all the authors.')
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: url,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                status: 'Fetching Authors'
            }
        }
        axios
        .post(url, config)
        .then((response) => {
            setAuthors(response.data.authors)
        })
        .catch(err => {
            console.error(err);
        });
    }, [setAuthors, url]);
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
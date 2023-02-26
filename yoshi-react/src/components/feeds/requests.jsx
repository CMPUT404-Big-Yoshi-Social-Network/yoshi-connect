import axios from 'axios';
import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import Request from './request.jsx';

function Requests() {
    const { username } = useParams();
    const [requests, setRequests] = useState([]);
    useEffect(() => {
        console.log('Debug: Fetching all the requests for this user')
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/server/requests',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                receiver: username,
                status: 'Fetching Requests'
            }
        }
        axios
        .post('/server/requests', config)
        .then((response) => {
            console.log(response.data.requests)
            setRequests(response.data.requests)
        })
        .catch(err => {
            console.error(err);
        });
    }, [setRequests, username]);
    return (
        <div>
            <h1>Friend Requests</h1>
            {Object.keys(requests).map((request, idx) => (
                <Request key={idx} {...requests[request]}/>
            ))}
        </div>
    )
}

export default Requests;
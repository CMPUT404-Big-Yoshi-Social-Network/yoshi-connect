import axios from 'axios';
import React, { useEffect, useState } from "react";
import Request from './request.jsx';

function Requests() {
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
                status: 'Fetching Requests'
            }
        }
        axios
        .post('/server/requests', config)
        .then((response) => {
            setRequests(response.data.requests)
        })
        .catch(err => {
            console.error(err);
        });
    }, [setRequests]);
    return (
        <div>
            <h4>Friend Requests</h4>
            {Object.keys(requests).map((request, idx) => (
                <Request key={idx} {...requests[request]}/>
            ))}
        </div>
    )
}

export default Requests;
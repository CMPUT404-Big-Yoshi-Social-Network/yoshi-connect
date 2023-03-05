import React from "react";
import axios from 'axios';
import { useEffect, useState } from "react";

function Request(props) {
    const { senderId } = props;
    const [username, setUsername] = useState({
        username: ''
    })
    useEffect(() => {
        let config = {
             method: 'post',
             maxBodyLength: Infinity,
             url: '/server/requests/',
             headers: {
                 'Content-Type': 'application/json'
             },
             data: {
                 sessionId: localStorage.getItem('sessionId'),
                 status: 'Fetching current authorId'
             }
         }
         axios
         .post('/server/requests/', config)
         .then((response) => {
             let username = response.data.username;
             setUsername(prevUsername => ({...prevUsername, username}))
         })
         .catch(err => { });
     }, []);
    const addRequest = () => {
        console.log('Debug: Adding Author')
        let config = {
            method: 'put',
            maxBodyLength: Infinity,
            url: '/server/requests',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                sender: senderId,
                receiver: username.username,
                status: 'Sender is added by Receiver'
            }
        }
        axios
        .put('/server/requests', config)
        .then((response) => {
        })
        .catch(err => {
            console.error(err);
        });
    }
    const rejectRequest = () => {
        console.log('Debug: Rejecting Author')
        let config = {
            method: 'delete',
            maxBodyLength: Infinity,
            url: '/server/requests',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                sender: senderId,
                receiver: username,
                status: 'Sender is rejected by Receiver'
            }
        }
        axios
        .delete('/server/requests', config)
        .then((response) => {
        })
        .catch(err => {
            console.error(err);
        });
    }
    return (
        <div id='request'>
            { senderId }
            <button type="button" id='accept' onClick={() => addRequest()}>Add</button>
            <button type="button" id='reject' onClick={() => rejectRequest()}>Reject</button>
        </div>
    )
}

export default Request;
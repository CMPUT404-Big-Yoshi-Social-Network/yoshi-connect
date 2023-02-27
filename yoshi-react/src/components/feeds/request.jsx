import React from "react";
import { useParams } from 'react-router-dom';
import axios from 'axios';

function Request(props) {
    const { senderId } = props;
    const { username } = useParams();
    const addRequest = () => {
        console.log('Debug: Adding Author')
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/server/requests',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                senderId: senderId,
                receiverId: username,
                status: 'Sender is added by Receiver'
            }
        }
        axios
        .post('/server/requests', config)
        .then((response) => {
            console.log(response)
        })
        .catch(err => {
            console.error(err);
        });
    }
    const rejectRequest = () => {
        console.log('Debug: Rejecting Author')
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/server/requests',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                sender: senderId,
                receiver: username,
                status: 'Sender is rejected by Receiver'
            }
        }
        axios
        .post('/server/requests', config)
        .then((response) => {
            console.log(response)
        })
        .catch(err => {
            console.error(err);
        });
    }
    return (
        <div>
            { senderId }
            <button type="button" id='accept' onClick={() => addRequest()}>Add</button>
            <button type="button" id='reject' onClick={() => rejectRequest()}>Reject</button>
        </div>
    )
}

export default Request;
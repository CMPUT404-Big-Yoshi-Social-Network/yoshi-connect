import React from "react";
import { useParams } from 'react-router-dom';
import axios from 'axios';

function Friend(props) {
    console.log(props)
    const { senderId } = props;
    return (
        <div id='friend'>
            { senderId }
        </div>
    )
}

export default Friend;
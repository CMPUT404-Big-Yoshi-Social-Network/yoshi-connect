import { Image } from 'react-bootstrap';
import React from 'react';
import './400.css';

function BadRequest() {
    return (
        <div className="sc400">
            <h1>400</h1>
            <h2>Your request resulted in an error</h2>
            <h3>BAD REQUEST</h3>
            <Image src='/images/status_code_400.png'/>
        </div>
    )
}

export default BadRequest;
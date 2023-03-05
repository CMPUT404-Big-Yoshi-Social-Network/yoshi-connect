import React from 'react';
import { Image } from 'react-bootstrap'
import './403.css'

function UserForbidden() {
    return (
        <div className="sc403">
            <h1>403</h1>
            <h2>You don't have permission to access this resource</h2>
            <h3>FORBIDDEN</h3>
            <Image src='/images/status_code_403.png'/>
        </div>
    )
}

export default UserForbidden;
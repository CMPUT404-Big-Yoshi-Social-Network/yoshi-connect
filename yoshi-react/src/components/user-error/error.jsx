// Functionality
import React from 'react';
import { useLocation } from "react-router-dom";

// User Interface
import { Image } from 'react-bootstrap';

// Styling
import './error.css';

export default function Errors() {
    /**
     * Description: Represents an Error depending on the status
     * Returns: N/A
     */
    const path = useLocation().pathname;
    console.log(path);

    const statusCode = ['400', '401', '403', '404', '500'];
    const statusDesc = ["Your request resulted in an error", 
                        "Your authorization failed", 
                        "You don't have permission to access this resource",
                        "Page Not Found",
                        "Internal Server Error"];
    const statusMsg = ['BAD REQUEST', 'UNAUTHORIZED', 'FORBIDDEN', 'NOT FOUND', 'SERVER ERROR'];
    let i = null;

    if (path === '/badrequest') {
        i = 0
    }
    else if (path === '/unauthorized'){
        i = 1
    }
    else if (path === '/forbidden'){
        i = 2
    }
    else if (path === '/notfound'){
        i = 3
    }
    else {
        i = 4
    }

    return(
        <div className='error'>
            <h1>{statusCode[i]}</h1>
            <h2>{statusDesc[i]}</h2>
            <h3>{statusMsg[i]}</h3>
            <Image src={'/images/status_code_'+statusCode[i]+'.png'}/>
        </div>
    )
}


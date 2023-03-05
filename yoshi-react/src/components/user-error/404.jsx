
import React from 'react';
import { Image } from 'react-bootstrap'
import './404.css'

function PageNotFound() {
    return (
        <div className="sc404">
            <h1>404</h1>
            <h2>Page Not Found</h2>
            <h3>NOT FOUND</h3>
            <Image src='/images/status_code_404.png'/>
        </div>
    )
}

export default PageNotFound;
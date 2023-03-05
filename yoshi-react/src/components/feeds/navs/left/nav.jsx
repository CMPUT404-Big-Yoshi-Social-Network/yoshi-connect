// import { useParams } from 'react-router-dom';
import React from 'react';
// import Container from 'react-bootstrap/Container';
// import Nav from 'react-bootstrap/Nav';
// import Navbar from 'react-bootstrap/Navbar';
import Following from '../../follows/following.jsx';
import './nav.css';

function LeftNavBar() {
    return (
        <div className='left-column'>
            <Following/>
        </div>
    )
}

export default LeftNavBar;
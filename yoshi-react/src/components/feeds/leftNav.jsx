import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Following from './following.jsx';
import './leftNav.css';

function LeftNavBar() {
    return (
        <div className='left-column'>
            <Following/>
        </div>
    )
}

export default LeftNavBar;
// import { useParams } from 'react-router-dom';
import React from 'react';
import { useParams } from 'react-router-dom';
// import Container from 'react-bootstrap/Container';
// import Nav from 'react-bootstrap/Nav';
// import Navbar from 'react-bootstrap/Navbar';
import Following from '../../follows/following.jsx';
import './nav.css';
import Friends from '../../friends/friends.jsx';
import SettingsNav from '../../settings/nav.jsx';

function LeftNavBar() {
    const url = window.location.pathname;
    const { username } = useParams();
    return (
        <div className='left-column'>
            { url === '/feed' || url === '/' + {username} ? <Following/> :
                url === '/friends' ? <Friends/> : 
                url === '/settings' ? <SettingsNav/> : 
                url === '/messages' ? <h2 style={{paddingLeft: '1em'}}>Messages</h2> : null
            }
        </div>
    )
}

export default LeftNavBar;
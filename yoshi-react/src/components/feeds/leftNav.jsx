import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import './leftNav.css';

function LeftNavBar() {
    const { location } = useParams();
    const [data, setData] = useState({ brand: '' });
    let toList = [];
/* TODO: following / friends / messages holds all the individuals the Author follows (list); need to get this variable */
    
    useEffect(()=>{
        if (location === 'friends') {
            setData({
                ...data,
                brand: 'Friends'
            })
        } else if (location === 'messages') {
            setData({
                ...data,
                brand: 'Messages'
            })
        } else { 
            setData({
                ...data,
                brand: 'Following'
            })
        }
    // eslint-disable-next-line
    }, [])
    
    
    return (
        <div className='left-column'>
            <Container>
                <Navbar.Brand>{ data.brand }</Navbar.Brand>
                <Nav>
                    <div> 
                        {Object.keys(toList).map((obj, idx) => (
                            <p key={idx} {...toList[obj]}/>
                        ))}
                    </div>
                </Nav>
            </Container>
        </div>
    )
}

export default LeftNavBar;
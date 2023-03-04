import { useNavigate } from 'react-router-dom';
import React, { useEffect } from "react";
import TopNav from '../feeds/topNav';
import LeftNavBar from '../feeds/leftNav.jsx';
import RightNavBar from '../feeds/rightNav.jsx';
import './settings.css';
function Settings() {
    const navigate = useNavigate();
    const loggedIn = () => {
        const token = localStorage.getItem('token');
        if (token === null) {
            console.log("Debug: You are not logged in.")
            return navigate('/login');
        }
        console.log("Debug: You are logged in.")
    }
    useEffect(() => {
        loggedIn();
    });
    return (
        <div className='settings'>
            <TopNav/>
            <div className='pubRow'>
                <div className='pubColL'>
                    <LeftNavBar/>
                </div>
                <div className='pubColM'>
                    You are viewing your settings. DEFAULT SHOULD BE ACCOUNT DETAILS!
                    <div className='profile-heading'>
                        <img className='ad-pubUserImg' alt='ad-pubUser' src='/images/public/icon_profile.png' width={40}/>
                    </div>
                    <Card.Body>
                        <Form className='account-details-form'>
                        <Form.Group className="account-details-a">
                            <p>Email</p>
                                <Form.Control
                                    name="email"
                                    onChange={(e) => {setData({...data, email: e.target.value})}}
                                    type="email" className='account-details-box'/>
                            </Form.Group>
                            <Form.Group className="account-details-a">
                                <p>Username</p>
                                <Form.Control
                                    name="username"
                                    onChange={(e) => {setData({...data, username: e.target.value})}}
                                    type="text" className='account-details-box'/>
                            </Form.Group>
                            <Form.Group className="account-details-a">
                                <p>Password</p>
                                <Form.Control
                                    name="password"
                                    onChange={(e) => {setData({...data, password: e.target.value})}}
                                    type="password" className='account-details-box'/>
                            </Form.Group>
                            <br></br>
                            <Button href='/' variant="warning" type="submit" className='signup-button'>Back</Button>
                            <Button onClick={getAccount} variant="warning" type="submit" className='signup-button'>Next</Button>
                        </Form>
                    </Card.Body>
                </div>
                <div className='pubColR'>
                    <RightNavBar/>
                </div>
            </div>
        </div>
    )
}

export default Settings;
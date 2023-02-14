import { useNavigate } from 'react-router-dom';
import React, { useEffect } from "react";
function PublicFeed() {
    const navigate = useNavigate();
    const checkForAuthor = () => {
        const token = localStorage.getItem('token');
        if (token === 'undefined') {
            console.log("Debug: You are not logged in.")
            alert("You are not logged in. Please log in!")
            return navigate('/login');
        }
        console.log("Debug: You are logged in.")
    }
    useEffect(() => {
        checkForAuthor();
    });
    const LogOut = () => {
        window.localStorage.setItem("token", 'undefined');
    }
    return (
        <div>
            Welcome to the Public Feed. You are signed in.
            <a href="/login" onClick={LogOut}>Log Out</a>
        </div> 
    )
}

export default PublicFeed;
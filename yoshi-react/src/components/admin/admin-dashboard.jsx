import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
function AdminDashboard() {
    // TODO: CHECK IF THE USER IS ADMIN AND LOGGED IN
    const navigate = useNavigate();
    const checkForAuthor = () => {
        const token = localStorage.getItem('token');
        if (token === 'undefined') {
            console.log("Debug: You are not logged in.")
            alert("You are not logged in. Please log in!")
            return navigate('/admin');
        }
        console.log("Debug: You are logged in.")
    }
    const checkAdmin = () => {
        const admin = localStorage.getItem('admin');
        if (admin === 'undefined') {
            console.log("Debug: You are not an admin.")
            alert("You are not an admin! >:(")
            return navigate('/admin')
        }
        console.log("Debug: You are an Admin.")
    }
    useEffect(() => {
        checkForAuthor();
        checkAdmin();
    });
    const LogOut = () => {
        window.localStorage.setItem("token", 'undefined');
    }
    return (
        <div>
            Hello. You are viewing the admin dashboard.
            <a href="/admin" onClick={LogOut}>Log Out</a>
        </div>
    )
}

export default AdminDashboard;
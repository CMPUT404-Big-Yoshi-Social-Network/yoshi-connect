import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
function AdminDashboard() {
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
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/admin',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: window.localStorage.getItem('token')
        }
        window.localStorage.setItem('token', 'undefined');
        axios
        .post('/admin/dashboard', config)
        .then((response) => console.log(response))
        .catch(err => {
          console.error(err);
        });
    }
    return (
        <div>
            Hello. You are viewing the admin dashboard.
            <a href="/admin" onClick={LogOut}>Log Out</a>
        </div>
    )
}

export default AdminDashboard;
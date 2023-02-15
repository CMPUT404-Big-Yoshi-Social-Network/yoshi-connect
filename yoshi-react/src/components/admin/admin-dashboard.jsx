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
    const checkExpiry = () => {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/admin',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                token: window.localStorage.getItem('token'),
                message: 'Checking expiry'
            }
        }
        axios
        .post('/admin/dashboard', config)
        .then((response) => {
            if (response.data.status === "Expired") {
                console.log("Debug: Your token is expired.")
                alert("You login is not cached anymore, sorry! Please log in again.")
                LogOut();
                navigate('/admin');
            }
            console.log('Debug: Your token is not expired.')
        })
        .catch(err => {
          console.error(err);
        });
    }
    useEffect(() => {
        checkForAuthor();
        checkAdmin();
        checkExpiry();
    });
    const LogOut = () => {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/admin',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                token: window.localStorage.getItem('token'),
                message: 'Logging Out'
            }
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
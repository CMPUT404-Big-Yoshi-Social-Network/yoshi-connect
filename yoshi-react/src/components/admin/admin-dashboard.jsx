import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
function AdminDashboard() {
    const navigate = useNavigate();
    /*
    const checkForAuthor = () => {
        if (token === null) {
            console.log("Debug: You are not logged in.")
            return navigate('/forbidden');
        }
        console.log("Debug: You are logged in.")
        return true;
    }
    const checkAdmin = () => {
        const admin = localStorage.getItem('admin');
        if (admin === null) {
            console.log("Debug: You are not an admin.")
            return navigate('/forbidden')
        }
        console.log("Debug: You are an Admin.")
        return true;
    }
    */
    const checkExpiry = () => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: '/',
        }
        axios
        .get('/admin/dashboard', config)
        .then((response) => {
            if (response.data.status === "Expired") {
                console.log("Debug: Your token is expired.");
                alert("You login is not cached anymore, sorry! Please log in again.");
                LogOut();
                navigate('/');
            }
            else if(response.data.status === "NonAdmin"){
                console.log("Debug: You're not an admin.")
                alert("You are not an admin! >:(")
                navigate('/feed');
            }
            console.log('Debug: Your token is not expired.')
        })
        .catch(err => {
          console.error(err);
        });
    }
    useEffect(() => {
        /*
        let isLogged = checkForAuthor();
        if (isLogged) {
            let isAdmin = checkAdmin();
            if (isAdmin) {
                checkExpiry();
            }
        }
        */
        checkExpiry();
    });
    const LogOut = () => {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/admin/dashboard',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                message: 'Logging Out'
            }
        }
        axios
        .post('/admin/dashboard', config)
        .then((response) => {
            console.log(response);
            navigate("/");
        })
        .catch(err => {
          console.error(err);
        });
    }
    return (
        <div>
            Hello. You are viewing the admin dashboard.
            <button type="button" onClick={() => LogOut()}>Log Out</button>
        </div>
    )
}

export default AdminDashboard;
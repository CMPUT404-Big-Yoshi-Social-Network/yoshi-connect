import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
function AdminDashboard() {
    const navigate = useNavigate();
    const get_dashboard = () => {
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
                navigate('/login');
            }
            else if(response.data.status === "NonAdmin"){
                console.log("Debug: You're not an admin.")
                alert("You are not an admin! >:(")
                navigate('/forbidden');
            }
            else {
                console.log("Successfully logged in");
            }
            console.log('Debug: Your token is not expired.')
        })
        .catch(err => {
            if (err.response.status === 403) {
                console.log("Debug: Forbidden.");
                navigate('/forbidden'); // 403 Forbidden
            }
        });
    }
    useEffect(() => {
       get_dashboard();
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
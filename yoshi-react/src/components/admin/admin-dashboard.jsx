import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Authors from './authors.jsx';
function AdminDashboard() {
    const navigate = useNavigate();
    const get_dashboard = () => {
        console.log('Debug: Getting Admin Dashboard')
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: '/',
        }
        axios
        .get('/server/admin/dashboard', config)
        .then((response) => {
            if (response.data.status === "Expired") {
                console.log("Debug: Your token is expired.");
                LogOut();
                navigate('/login');
            }
            else if(response.data.status === "NonAdmin"){
                console.log("Debug: You're not an admin.")
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
            url: '/server/admin/dashboard',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                message: 'Logging Out'
            }
        }
        axios
        .post('/server/admin/dashboard', config)
        .then((response) => {
            navigate("/");
        })
        .catch(err => {
          console.error(err);
        });
    }
    return (
        <div>
            <h1>Admin Dashboard</h1>
            <button type="button" onClick={() => LogOut()}>Log Out</button>
            <div><Authors/></div>
        </div>
    )
}

export default AdminDashboard;
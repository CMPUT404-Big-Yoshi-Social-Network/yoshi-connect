import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import React, { useEffect } from "react";
function PublicFeed() {
    const navigate = useNavigate();
    //Depracate this
    /*
    const checkForAuthor = () => {
        const token = localStorage.getItem('token');
        if (token === null) {
            console.log("Debug: You are not logged in.")
            return navigate('/unauthorized');
        }
        console.log("Debug: You are logged in.")
        return true;
    }
    */
    const checkExpiry = () => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: '/feed',
        }
        axios
        .get('/feed', config)
        .then((response) => {
            if (response.data.status === "Expired") {
                console.log("Debug: Your token is expired.")
                alert("You login is not cached anymore, sorry! Please log in again.")
                LogOut();
                navigate('/');
            }
            else{console.log('Debug: Your token is not expired.')}
        })
        .catch(err => {
          console.error(err);
        });
    }
    useEffect(() => {
        /*
        let isLogged = checkForAuthor();
        if (isLogged) {
            checkExpiry();
        }
        */
       checkExpiry();
    });
    const LogOut = () => {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/feed',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                message: 'Logging Out'
            }
        }
        axios
        .post('/feed', config)
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
            Welcome to the Public Feed. You are signed in.
            <button type="button" onClick={() => LogOut()}>Log Out</button>
        </div>
    )
}

export default PublicFeed;
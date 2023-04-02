/*
Copyright 2023 Kezziah Camille Ayuno, Alinn Martinez, Tommy Sandanasamy, Allan Ma, Omar Niazie

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.


Furthermore it is derived from the Python documentation examples thus
some of the code is Copyright © 2001-2013 Python Software
Foundation; All Rights Reserved
*/

// Functionality
import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import { getUserActivity } from "gh-recent-activity";
// import GitHubFeed from 'react-github-activity'

// Child Component
import TopNav from '../navs/top/nav.jsx';
import LeftNavBar from '../navs/left/nav.jsx';
import RightNavBar from '../navs/right/nav.jsx';
import Activity from "./githubActivity.jsx";

// Styling
import './github.css';

function GitHub() {
    /**
     * Description: Represents the GitHub page in settings
     * Functions: 
     *     - useEffect(): Before rendering, checks if the author is logged in to authorize routing
     * Returns: N/A
     */
    const test = 
    
    [
        {
          "text": "Created profile-pic branch on CMPUT404-Big-Yoshi-Social-Network/yoshi-connect",
          "user": {
            "name": "Holy-Hero",
            "link": "https://github.com/Holy-Hero",
            "img": "https://avatars.githubusercontent.com/u/47871461?"
          },
          "repo": {
            "name": "CMPUT404-Big-Yoshi-Social-Network/yoshi-connect",
            "link": "https://github.com/CMPUT404-Big-Yoshi-Social-Network/yoshi-connect"
          },
          "created": {
            "type": "branch",
            "branch": "profile-pic"
          },
          "type": "create"
        },
        {
          "text": "Opened PR at CMPUT404-Big-Yoshi-Social-Network/yoshi-connect",
          "user": {
            "name": "Holy-Hero",
            "link": "https://github.com/Holy-Hero",
            "img": "https://avatars.githubusercontent.com/u/47871461?"
          },
          "repo": {
            "name": "CMPUT404-Big-Yoshi-Social-Network/yoshi-connect",
            "link": "https://github.com/CMPUT404-Big-Yoshi-Social-Network/yoshi-connect"
          },
          "pr": {
            "prNumber": 118,
            "state": "open",
            "title": "Unit test backend",
            "url": "https://github.com/CMPUT404-Big-Yoshi-Social-Network/yoshi-connect/pull/118"
          },
          "type": "pull_request"
        },
        {
          "text": "Closed PR at CMPUT404-Big-Yoshi-Social-Network/yoshi-connect",
          "user": {
            "name": "Holy-Hero",
            "link": "https://github.com/Holy-Hero",
            "img": "https://avatars.githubusercontent.com/u/47871461?"
          },
          "repo": {
            "name": "CMPUT404-Big-Yoshi-Social-Network/yoshi-connect",
            "link": "https://github.com/CMPUT404-Big-Yoshi-Social-Network/yoshi-connect"
          },
          "pr": {
            "prNumber": 117,
            "state": "closed",
            "title": "Unit test backend",
            "url": "https://github.com/CMPUT404-Big-Yoshi-Social-Network/yoshi-connect/pull/117"
          },
          "type": "pull_request"
        }
      ]

    const navigate = useNavigate();
    const [data, setData] = useState({
        viewer: "",
        github: "",
        activities: [],
        pfp: ""
    }) 
    useEffect(() => {
        /**
         * Description: Before render, checks the author's account details
         * Request: POST
         * Returns: N/A
         */
        const getAuthor = () => {

            axios
            .get('/userinfo')
            .then((response) => {
                setData({...data, veiwer: response.data.authorId, github: response.data.github, activities: test, pfp: test[0].user.img})
                // if (response.data.github !== "") {
                //     getUserActivity(response.data.github).then((res) => {
                //         for (let i = 0; i < res.length; i++) {
                //             data.activities.push(res[i])
                //         }
                //     })
                // }
            })
            .catch(err => { 
                if (err.response.status === 404) { 
                    setData({...data, veiwer: "", github: ""})
                } else if (err.response.status === 401) {
                    navigate('/unauthorized')
                }   
            });
        }
        getAuthor();
    }, [navigate, data, test])

    return (
        <div>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/octicons/3.5.0/octicons.min.css"></link>
            <TopNav/>
            <div className='pubRow'>
                <div className='pubColL'>
                    <LeftNavBar authorId={data.viewer}/>
                </div>
                <div className='pubColM'>
                    {data.activities === [] ? null : <img className="pfp" src={data.pfp} alt=""/>}
                    <img src={"https://ghchart.rshah.org/" + data.github} alt="" style={{margins: "10em", padding: "1em" }}/>
                    {Object.keys(data.activities).map((activity, idx) => (
                        <Activity key={idx} activity={data.activities[activity]}/>
                    ))}
                    </div>
                <div className='pubColR'>
                    <RightNavBar/>
                </div>
            </div>
        </div>
    )
}

export default GitHub;
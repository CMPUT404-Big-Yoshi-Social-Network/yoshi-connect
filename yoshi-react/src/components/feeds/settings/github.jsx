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
import React, { useEffect, useState, useRef } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import { getUserActivity } from "gh-recent-activity";

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

    const navigate = useNavigate();
    const [data, setData] = useState({
        viewer: "",
        githubUsername: "",
        activities: [],
        pfp: ""
    }) 
    // const [value, setValue] = useState()
    const whenToUpdate = useRef(true)

    useEffect(() => {
        /**
         * Description: Before render, checks the author's account details
         * Request: POST
         * Returns: N/A
         */
        const getAuthor = () => {
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: '/userinfo',
                headers: { 'Content-Type': 'application/json' }
            }

            axios
            .get('/userinfo', config)
            .then((response) => {
                setData(d => ({...d, veiwer: response.data.authorId}))
                if (response.data.github !== "") {
                  axios.get("https://api.github.com/users/" + response.data.github.split("/")[3] + "/events")
                  .then((res) => {
                      for (let i = 0; i < res.data.length; i++) {
                          data.activities.push(res.data[i])
                      }
                      setData(d => ({...d, githubUsername: res.data[0].actor.login, pfp: res.data[0].actor.avatar_url}))
                  })
                  .catch((e) => { console.log("Debug: Failed to get activities")})
                }
            })
            .catch(err => { 
                if (err.response.status === 404) { 
                    setData(d => ({...d, viewer: "", githubUsername: ""}))
                } else if (err.response.status === 401) {
                    navigate('/unauthorized')
                }   
            });
        }
        getAuthor();
    }, [navigate, whenToUpdate, data.activities])

    return (
        <div>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/octicons/3.5.0/octicons.min.css"></link>
            <TopNav/>
            <div className='pubRow'>
                <div className='pubColL'>
                    {/* <LeftNavBar authorId={data.viewer}/> */}
                    <LeftNavBar/>
                </div>
                <div className='pubColM'>
                    {data.activities === [] ? "Loading" : <img className="github-pfp" src={data.pfp} alt="" width={150}/>}
                    {data.activities === [] ? null :<h1 className="github-username">{data.githubUsername}</h1>}
                    {data.activities === [] ? null :<img className='github-chart' src={"https://ghchart.rshah.org/" + data.githubUsername} alt="" width={800}/>}
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
import { useNavigate, useParams } from 'react-router-dom';
import React, { useEffect } from "react";
import { useState, useRef } from 'react';
import axios from 'axios';
// import TopNav from '../navs/top/nav.jsx';
// import LeftNavBar from '../navs/left/nav.jsx';
// import RightNavBar from '../navs/right/nav.jsx';
import './profile.css';
import Posts from '../../posts/posts.jsx';

function Profile() {
    const { username } = useParams();
    const [personal, setPersonal] = useState({
        person: null,
        viewer: null,
        viewed: null
    })
    const [requestButton, setRequestButton] = useState('Add');
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();
    let exists = useRef(null);
    useEffect(() => {
        const checkExpiry = () => {
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: '/feed',
            }
            axios
            .get('/server/feed', config)
            .then((response) => {
                if (response.data.status === "Expired") {
                    console.log("Debug: Your token is expired.")
                    LogOut();
                    navigate('/');
                }
                else{console.log('Debug: Your token is not expired.')}
            })
            .catch(err => {
                if (err.response.status === 401) {
                    console.log("Debug: Not authorized.");
                    navigate('/unauthorized'); // 401 Not Found
                }
            });
        }
        checkExpiry();
    })
    useEffect(() => {
        const isRealProfile = () => {
            axios
            .get('/server/users/' + username)
            .then((response) => {
                console.log('Debug: Profile Exists.')
                const person = response.data.personal
                const viewer = response.data.viewer
                const viewed = response.data.viewed
                setPersonal(prevPersonal => ({...prevPersonal, person}))
                setPersonal(prevViewer => ({...prevViewer, viewer}))
                setPersonal(prevViewing => ({...prevViewing, viewed}))
            })
            .catch(err => {
                if (err.response.status === 404) {
                    console.log("Debug: Profile does not exist.");
                    navigate('/notfound'); 
                }
                else if (err.response.status === 401) {
                    console.log("Debug: Not authorized.");
                    navigate('/unauthorized'); 
                }
            });
        }
        isRealProfile();
    }, [navigate, setPersonal, username])
    useEffect(() => {
        if (!personal.person) { 
            console.log('Debug: Checking if the viewer has already sent a friend request.')
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: '/server/users/' + username,
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: {
                    receiver: personal.viewed,
                    sender: personal.viewer,
                    status: 'Does Request Exist'
                }
            }
            axios
            .post('/server/users/' + username, config)
            .then((response) => {
                if (response.data.status === 'Successful') {
                    console.log('Debug: Friend Request Exists.')
                    exists.current = true;
                } else {
                    console.log('Debug: Friend Request does not exist.')
                    exists.current = false;
                }
            })
            .catch(err => {
              console.error(err);
            });
        }
    }, [username, exists, personal]);
    useEffect(() => {
        if (!exists.current && !personal.person) {
            console.log('See if they are followers or friends.');
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: '/server/users/' + username,
                headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: {
                    viewed: personal.viewed,
                    viewer: personal.viewer,
                    status: 'Friends or Follows'
                }
            }
            axios
            .post('/server/users/' + username, config)
            .then((response) => {
                if (response.data.status === 'Friends') {
                    console.log('Debug: They are friends.')
                    setRequestButton('Unfriend');
                } else if (response.data.status === 'Follows') {
                    console.log('Debug: They are follows.')
                    setRequestButton('Unfollow');
                }
            })
            .catch(err => {
            console.error(err);
            });
        }
    }, [username, personal, exists, setRequestButton, requestButton])
    useEffect(() => { 
        console.log('Debug: Getting posts')
        const getPosts = () => {
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: '/server/users/posts',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: {
                    personal: personal.person,
                    viewed: personal.viewed,
                    viewer: personal.viewer
                }
            }
            axios
            .post('/server/users/posts', config)
            .then((response) => {
                setPosts(response.data.posts)
            })
            .catch(err => {
                console.error(err);
            });
        }
        getPosts();
    }, [personal]);
    const SendRequest = () => {
        if (requestButton === "Add") {
            setRequestButton('Sent');
            let config = {
                method: 'put',
                maxBodyLength: Infinity,
                url: '/server/users/' + username,
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: {
                    receiver: personal.viewed,
                    sender: personal.viewer,
                    status: 'Save Request'
                }
            }
            axios
            .put('/server/users/' + username, config)
            .then((response) => {
                console.log('Debug: Friend request sent!')
            })
            .catch(err => {
              console.error(err);
            });
        } else if (requestButton === "Sent") {
            setRequestButton('Add')
            let config = {
                method: 'delete',
                maxBodyLength: Infinity,
                url: '/server/users/' + username,
                headers: {
                  'Content-Type': 'application/json'
                },
                data: {
                    receiver: personal.viewed,
                    sender: personal.viewer,
                    status: 'Delete Request'
                }
            }
            axios
            .delete('/server/users/' + username, config)
            .then((response) => {
                console.log('Debug: Friend request deleted!')
            })
            .catch(err => {
              console.error(err);
            });
        } else if (requestButton === 'Unfriend') {
            console.log('Debug: We want to unfriend.')
            let config = {
                method: 'put',
                maxBodyLength: Infinity,
                url: '/server/users/' + username,
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: {
                    receiver: personal.viewed,
                    sender: personal.viewer,
                    status: 'Unfriending'
                }
            }
            axios
            .put('/server/users/' + username, config)
            .then((response) => {
                if (response.data.status) {
                    console.log('Debug: Friend is unfriended.')
                    setRequestButton('Add');
                }
            })
            .catch(err => {
              console.error(err);
            });
        } else if (requestButton === "Unfollow") {
            console.log('Debug: We want to unfollow.')
            let config = {
                method: 'put',
                maxBodyLength: Infinity,
                url: '/server/users/' + username,
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: {
                    receiver: personal.viewed,
                    sender: personal.viewer,
                    status: 'Unfollowing'
                }
            }
            axios
            .put('/server/users/' + username, config)
            .then((response) => {
                if (response.data.status) {
                    console.log('Debug: Follow is unfollowed.')
                    setRequestButton('Add');
                }
            })
            .catch(err => {
              console.error(err);
            });
        }
    }
    const LogOut = () => {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/server/feed',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                message: 'Logging Out'
            }
        }
        axios
        .post('/server/feed', config)
        .then((response) => {
            localStorage['sessionId'] = "";
            navigate("/");
        })
        .catch(err => {
          console.error(err);
        });
    }
    return (
        <div>
            {/* <TopNav/>
            <div className='pubRow'>
                <div className='pubColL'>
                    <LeftNavBar/>
                </div>
                <div className='pubColM'>
                    You are viewing profile. Welcome to {username}'s profile!
                    { personal.person ? null : exists.current ? <button type="button" id='request' onClick={() => SendRequest()}>Sent!</button> : friends.current ? <button type="button" id='request' onClick={() => SendRequest()}>Unfriend</button> : friends.current === false ? <button type="button" id='request' onClick={() => SendRequest()}>Unfollow</button> : <button type="button" id='request' onClick={() => SendRequest()}>Add Friend</button>}
                    <br></br>
                    { personal.person ? <div><Requests username={username}/></div> : null }
                </div>
                <div className='pubColR'>
                    <RightNavBar/>
                </div>
            </div>
        </div> */}
            <h1>{username} Profile</h1>
            { personal.person ? null : 
                <button type="button" id='request' onClick={() => SendRequest()}>{requestButton}</button>}
            <h2>Posts</h2>
            <Posts viewerId={null} posts={posts}/>   
        </div> 
    )
}

export default Profile;
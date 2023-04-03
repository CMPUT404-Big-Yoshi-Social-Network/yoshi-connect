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

// Styling
import './App.css';

// Functionality 
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import React from 'react';

// Before Entering YoshiConnect
// import Welcome from "./components/welcome/welcome.jsx";
import Login from "./components/login/login.jsx";
import Signup from "./components/signup/signup.jsx";

// Admin 
import AdminLogin from "./components/admin/admin.jsx";
import AdminDashboard from "./components/admin/dashboard/adminDashboard.jsx";

// Feeds
// import Feed from "./components/feeds/feed/feed.jsx";
import PublicFeed from "./components/feeds/public/public.jsx";
import FriendFeed from "./components/feeds/friends/feed.jsx";
import Messages from "./components/feeds/messages/messages.jsx";

// Posts
import SinglePost from "./components/posts/singlePost.jsx"

// Author Specifics
import Profile from "./components/feeds/profile/profile.jsx";
import Settings from './components/feeds/settings/settings.jsx';

// Errors
import Errors from './components/user-error/errors.jsx';

// API Docs
import ApiDocs from "./components/apiDocs/apiDocs.jsx";

// GitHub
import GitHub from "./components/feeds/settings/github.jsx"

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicFeed/>
  },
  {
    path: '/login',
    element: <Login/>
  },
  {
    path: '/signup/',
    element: <Signup/>
  },
  {
    path: '/admin/',
    element: <AdminLogin/>
  },
  {
    path: '/admin/dashboard/',
    element: <AdminDashboard/>
  },
  {
    path: '/feed/',
    element: <PublicFeed/>
  },
  {
    path: '/friends/',
    element: <FriendFeed/>
  },
  {
    path: '/users/:username/', 
    element: <Profile/>
  },
  {
    path: '/users/:username/posts/:postId', 
    element: <SinglePost/>
  },
  {
    path: '/messages/', 
    element: <Messages/>
  },
  {
    path: '/forbidden/', 
    element: <Errors/>   
  },
  {
    path: '/unauthorized/', 
    element: <Errors/>    
  },
  {
    path: '/badrequest/', 
    element: <Errors/>    
  },
  {
    path: '/settings/', 
    element: <Settings/>   
  },
  {
    path: '/api-docs',
    element: <ApiDocs/>
  },
  {
    path: '*' || '/notfound/', 
    element: <Errors/>     
  },
  {
    path: '/servererror/',
    element: <Errors/>
  }, 
  {
    path: '/github/', 
    element: <GitHub/>
  }
])
  
function App() {
  return <RouterProvider router={router} />
}
  
export default App;
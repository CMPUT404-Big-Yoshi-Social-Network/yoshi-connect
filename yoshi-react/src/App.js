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
import Welcome from "./components/welcome/welcome.jsx";
import Login from "./components/login/login.jsx";
import Signup from "./components/signup/signup.jsx";

// Admin 
import AdminLogin from "./components/admin/admin.jsx";
import AdminDashboard from "./components/admin/adminDashboard.jsx";

// Feeds
import PublicFeed from "./components/feeds/public/public.jsx";
import FriendFeed from "./components/feeds/friends/friendFeed.jsx";
import Messages from "./components/feeds/messages/messages.jsx";

// Author Specifics
import Profile from "./components/feeds/profile/profile.jsx";
import Settings from './components/feeds/settings/settings.jsx';

// Errors
import PageNotFound from "./components/user-error/404/404.jsx";
import UserForbidden from "./components/user-error/403/403.jsx";
import UserUnauthorized from "./components/user-error/401/401.jsx";
import BadRequest from './components/user-error/400/400.jsx';

// API Docs
import ApiDocs from "./components/api-docs/api-docs.jsx";

const router = createBrowserRouter([
  {
    path: '/',
    element: <Welcome/>
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
    path: '/messages/', 
    element: <Messages/>
  },
  {
    path: '/forbidden/', 
    element: <UserForbidden/>   
  },
  {
    path: '/unauthorized/', 
    element: <UserUnauthorized/>   
  },
  {
    path: '/badrequest/', 
    element: <BadRequest/>   
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
    element: <PageNotFound/>   
  }
])
  
function App() {
  return <RouterProvider router={router} />
}
  
export default App;
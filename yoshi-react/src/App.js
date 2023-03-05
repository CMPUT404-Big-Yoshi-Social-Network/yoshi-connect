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

import "./App.css";
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// Routable pages
import Welcome from "./components/welcome/welcome.jsx";
import Login from "./components/login/login.jsx";
import Signup from "./components/signup/signup.jsx";
import AdminLogin from "./components/admin/admin.jsx";
import AdminDashboard from "./components/admin/adminDashboard.jsx";
import PublicFeed from "./components/feeds/public.jsx";
import FriendFeed from "./components/feeds/friend.jsx";
import Profile from "./components/feeds/profile.jsx";
import Messages from "./components/feeds/messages.jsx";
import PageNotFound from "./components/userError/404.jsx";
import UserForbidden from "./components/userError/403.jsx";
import UserUnauthorized from "./components/userError/401.jsx";
import ApiDocs from "./components/apiDocs/apiDocs.jsx";

const router = createBrowserRouter([
  {
    path: '/',
    element: <Welcome/>
  },
  {
    path: '/login/',
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
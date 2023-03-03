import "./App.css";
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Welcome from "./components/welcome/welcome.jsx";
import Login from "./components/login/login.jsx";
import Signup from "./components/signup/signup.jsx";
import AdminLogin from "./components/admin/admin.jsx";
import AdminDashboard from "./components/admin/admin-dashboard.jsx";
import PublicFeed from "./components/feeds/public.jsx";
import FriendFeed from "./components/feeds/friend.jsx";
import Profile from "./components/feeds/profile.jsx";
import Messages from "./components/feeds/messages.jsx";
import PageNotFound from "./components/user-error/404.jsx";
import UserForbidden from "./components/user-error/403.jsx";
import UserUnauthorized from "./components/user-error/401.jsx";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

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
    path: '/api/docs',
    element: <SwaggerUI type="module" url="/server/api-docs.json" />
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
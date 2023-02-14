import "./App.css";
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Welcome from "./components/welcome/welcome";
import Login from "./components/login/login";
import Signup from "./components/signup/signup";
import AdminLogin from "./components/admin/admin";
import AdminDashboard from "./components/admin/admin-dashboard";
import PublicFeed from "./components/feeds/public";
import FriendFeed from "./components/feeds/friend";

const router = createBrowserRouter([ // Still need messages, group chats, etc
  {
    path: '/',
    element: <Welcome/>
  },
  {
    path: '/login',
    element: <Login/>
  },
  {
    path: '/signup',
    element: <Signup/>
  },
  {
    path: '/admin',
    element: <AdminLogin/>
  },
  {
    path: '/admin/dashboard',
    element: <AdminDashboard/>
  },
  {
    path: '/feed',
    element: <PublicFeed/>
  },
  {
    path: '/friends',
    element: <FriendFeed/>
  }
])
  
function App() {
  return <RouterProvider router={router} />
}
  
export default App;
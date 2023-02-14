import "./App.css";
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Welcome from "./components/welcome/welcome.jsx";
import Login from "./components/login/login.jsx";
import Signup from "./components/signup/signup.jsx";
import AdminLogin from "./components/admin/admin.jsx";
import AdminDashboard from "./components/admin/admin-dashboard.jsx";
import PublicFeed from "./components/feeds/public.jsx";
import FriendFeed from "./components/feeds/friend.jsx";
import Profile from "./components/profile/profile.jsx";

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
  },
  {
    path: '/:username', // want by user name 
    element: <Profile/>
  }
])
  
function App() {
  return <RouterProvider router={router} />
}
  
export default App;
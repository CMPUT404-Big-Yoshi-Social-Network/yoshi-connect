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
import CreatePost from "./components/posts/createPost.jsx";
import Messages from "./components/feeds/messages.jsx";
import PageNotFound from "./components/user-error/404.jsx";
import UserForbidden from "./components/user-error/403.jsx";
import UserUnauthorized from "./components/user-error/401.jsx";
import Post from "./components/posts/post.jsx";

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
    path: '/post',
    element: <CreatePost/>
  },
  
  {
    path: '/posts/', 
    element: <Post/>
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
    path: '*' || '/notfound/', 
    element: <PageNotFound/>   
  }
])
  
function App() {
  return <RouterProvider router={router} />
}
  
export default App;
import './App.css'
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
import BadRequest from './components/user-error/400.jsx';
import Settings from './components/settings/settings.jsx';
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
<<<<<<< HEAD
    path: '/messages/',
    element: <Messages/>
  },
  {
    path: '/forbidden/',
=======
    path: '/messages/', 
    element: <Messages/>
  },
  {
    path: '/forbidden/', 
>>>>>>> a18b3e021f6a12a58c2bf9d91bf3cb7b27024341
    element: <UserForbidden/>   
  },
  {
    path: '/unauthorized/', 
    element: <UserUnauthorized/>   
  }, 
  {
    path: '*' || '/notfound/', 
    element: <PageNotFound/>   
  },
  {
<<<<<<< HEAD
    path: '/badrequest/', 
    element: <BadRequest/>   
  },
  {
    path: '/settings/', 
    element: <Settings/>   
=======
    path: '/api-docs',
    element: <ApiDocs/>
  },
  {
    path: '*' || '/notfound/', 
    element: <PageNotFound/>   
>>>>>>> a18b3e021f6a12a58c2bf9d91bf3cb7b27024341
  }
])
  
function App() {
  return <RouterProvider router={router} />
}
  
export default App;
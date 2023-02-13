import "./App.css";
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Welcome from "./components/welcome/welcome";
import Login from "./components/login/login";
import Signup from "./components/signup/signup";
import AdminLogin from "./components/admin/admin";
import AdminDashboard from "./components/admin/admin-dashboard";

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
  }
])
  
function App() {
  return <RouterProvider router={router} />
}
  
export default App;
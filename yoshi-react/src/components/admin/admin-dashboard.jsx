function AdminDashboard() {
    // TODO: CHECK IF THE USER IS ADMIN AND LOGGED IN
    const LogOut = () => {
        window.localStorage.setItem("token", 'undefined');
    }
    return (
        <div>
            Hello. You are viewing the admin dashboard.
            <a href="/login" onClick={LogOut}>Log Out</a>
        </div>
    )
}

export default AdminDashboard;
//import { useParams } from 'react-router-dom';
// import { useEffect } from 'react';
// import axios from 'axios';
import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import './rightAdminNav.css';

function RightAdminNavBar() {
    //const { username } = useParams();

    return (
        <Navbar className="right-admin-column">
            <Container>
                <Nav>
                    <div className='rn-admdiv'>
                    {/* TODO: Needs to fetch username  */}
                        <img className='rn-admUserImg' alt='rn-admUser' src='/images/public/icon_profile.png' width={40}/>
                        <Nav.Link className='rn-user'href="/users/:username">Username</Nav.Link> 
                    </div>
                    <div className='rn-admdiv'>
                        <img className='rn-admDashImg' alt='rn-admDashImg' src='/images/admin/icon_dashboard.png' width={25}/>
                        <Nav.Link className='rn-admdash' href="/admin/dashboard">Dashboard</Nav.Link>
                    </div>
                    <div className='rn-admdiv'>
                        <img className='rn-admAdminsImg' alt='rn-admAdminsImg' src='/images/admin/icon_admins.png' width={25}/>
                        <Nav.Link className='rn-admadmins' href="/admin/admins">Admins</Nav.Link>
                    </div>
                    <div className='rn-admdiv'>
                        <img className='rn-admUsersImg' alt='rn-admUsersImg' src='/images/admin/icon_users.png' width={25}/>
                        <Nav.Link className='rn-admuser' href="/admin/users">Users</Nav.Link>
                    </div>
                    {/* <div className='rn-admdiv'>
                        <img className='rn-admServerImg' alt='rn-admServerImg' src='/images/icon_create_post.png' width={25}/>
                        <Nav.Link className='rn-admserver'href="/admin/servers">Servers</Nav.Link>
                    </div>
                    <div className='rn-admdiv'>
                        <img className='rn-admNodesImg' alt='rn-admNodesImg' src='/images/icon_messages.png' width={25}/>
                        <Nav.Link className='rn-admnodes' href="/admin/nodes">Nodes</Nav.Link>
                    </div> */}
                </Nav>
                <div className='rn-admdiv'>
                    <a href='/settings'>
                        <img className='rn-admCogImg' alt='rn-admCogImg' src='/images/public/icon_settings.png' width={40}/>
                    </a>
                    <Button href='/feed' variant="warning" type="submit" className='goto-user-dashboard'>User Dashboard</Button>
                </div>
            </Container>
        </Navbar>
    )
}

export default RightAdminNavBar;
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

function AuthorNavBar() {
    const LogOut = () => {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/server/feed',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                message: 'Logging Out'
            }
        }
        axios
        .post('/server/feed', config)
        .then((response) => {
            navigate("/");
        })
        .catch(err => {
          console.error(err);
        });

    }
    return (
        <Navbar className="flex-column">
            <Container>
                <Navbar.Brand>Settings</Navbar.Brand>
                <Nav>
                    <div>
                        <Nav.Link href="/settings">Account Details</Nav.Link>
                    </div>
                    <div>
                        <Nav.Link href="/password">Change Password</Nav.Link>
                    </div>
                    <div>
                        <Nav.Link href="/github">GitHub</Nav.Link>
                    </div>
                    <div>
                        <Nav.Link onClick={() => LogOut()}>Log Out</Nav.Link>
                    </div>
                </Nav>
            </Container>
        </Navbar>
    )
}
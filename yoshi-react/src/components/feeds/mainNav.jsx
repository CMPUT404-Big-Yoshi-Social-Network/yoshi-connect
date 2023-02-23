import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

function MainNav() {
    return (
        // TODO: Need to Add Search functionality and Notification Functionality
        // Might need to query notifications and use map (refer to changingNav.jsx
        <Navbar>
            <Container>
                <Navbar.Brand href="/feed">Yoshi Connect</Navbar.Brand>
                <Nav>
                    <div>
                        <Nav.Link href="/search">Search</Nav.Link>
                    </div>
                    <div>
                        <Nav.Link href="/notifications">Notifications</Nav.Link>
                    </div>
                </Nav>
            </Container>
        </Navbar>
    )
}

export default MainNav;


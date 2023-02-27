import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import './rightNav.css';

function RightNavBar() {
    return (
        <Navbar className="right-column">
            <Container>
                <Nav>
                    {/* <div>
                        <Nav.Link href="/users/:username">{username}</Nav.Link> TODO: Needs to fetch username 
                    </div> */}
                    <div>
                        <Nav.Link className='rn-feed' href="/feed">Public Feed</Nav.Link>
                    </div>
                    <div>
                        <Nav.Link className='rn-friends' href="/friends">Friends Feed</Nav.Link>
                    </div>
                    <div>
                        <Nav.Link className='rn-msgs' href="/messages">Messages</Nav.Link>
                    </div>
                    {/* <div>
                        <Nav.Link href="/post">Create Post</Nav.Link> TODO: Create post
                    </div> */}
                </Nav>
            </Container>
        </Navbar>
    )
}

export default RightNavBar;
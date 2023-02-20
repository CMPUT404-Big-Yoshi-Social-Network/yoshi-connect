import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

function ChangingNavBar() {
    const { location } = useParams();
    const [data, setData] = useState({
        brand: ''
      })
    let toList = [];
    {/* TODO: following / friends / messages holds all the individuals the Author follows (list); need to get this variable */}
    if (location === 'friends') {
        setData({
            ...data,
            brand: 'Friends'
        })
    } else if (location === 'messages') {
        setData({
            ...data,
            brand: 'Messages'
        })
    } else { 
        setData({
            ...data,
            brand: 'Following'
        })
    }
    return (
        <Navbar className="flex-column">
            <Container>
                <Navbar.Brand>{ brand }</Navbar.Brand>
                <Nav>
                    <div> 
                        {Object.keys(toList).map((obj, idx) => (
                            <Follow key={idx} {...toList[obj]}/>
                        ))}
                    </div>
                </Nav>
            </Container>
        </Navbar>
    )
}

export default ChangingNavBar;
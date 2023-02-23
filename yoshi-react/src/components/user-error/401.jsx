import { Image } from 'react-bootstrap'
import './401.css'

function UserUnauthorized() {
    return (
        <div className="sc401">
            <h1>401</h1>
            <h2>Your authorization failed</h2>
            <h3>UNAUTHORIZED</h3>
            <Image src='/images/status_code_401.png'/>
        </div>
    )
}

export default UserUnauthorized;
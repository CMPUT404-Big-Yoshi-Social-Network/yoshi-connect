import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LogOut() {
    const navigate = useNavigate();
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

export default LogOut;
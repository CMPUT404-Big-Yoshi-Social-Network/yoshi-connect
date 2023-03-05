import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCallback } from "react";

const LogOut = useCallback(() => {
  console.log('Debug: Attempting to log out.')
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
      localStorage['sessionId'] = "";
      navigate("/");
  })
  .catch(err => {
    console.error(err);
  });
}, [navigate]);

export default LogOut;
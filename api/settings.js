// Routing
const { apiUpdateAuthor } = require('../routes/author');
const { removeLogin } = require('../routes/auth');

// Router Setup
const express = require('express'); 
//TODO import check expiry
// Router
const router = express.Router({mergeParams: true});

router.post('/logout', async (req, res) => { removeLogin(req, res); })

router.put('/', async (req, res) => {
  const status = await apiUpdateAuthor(req.cookies.token, req.body.data);

  if (status == 401) { 
    return res.sendStatus(401); 
  } else if (status == 404) {
    return res.sendStatus(404);
  } else if (status == 200) {
    return res.sendStatus(200);
  }


})

module.exports = router;
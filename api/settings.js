// Routing
const { updateAuthor } = require('../routes/author');
const { removeLogin } = require('../routes/auth');

// Router Setup
const express = require('express'); 
//TODO import check expiry
// Router
const router = express.Router({mergeParams: true});

router.post('/logout', async (req, res) => { removeLogin(req, res); })

router.put('/', async (req, res) => {
  const status = await updateAuthor(req.cookies.token, req.body.data);
  return res.sendStatus(status);
})

module.exports = router;
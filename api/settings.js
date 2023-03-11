// Routing
const { getCurrentAuthor, updateAuthor } = require('../routes/author');
const { removeLogin } = require('../routes/auth');

// Router Setup
const express = require('express'); 

// Router
const router = express.Router();

router.post('/', async (req, res) => {
  if((await checkExpiry(req, res))){ return res.sendStatus(401) }
  console.log('Debug: Updating author account details');
  if (req.body.data.status === 'Get Author') { await getCurrentAuthor(req, res); }
})

router.post('/logout', async (req, res) => { removeLogin(req, res); })

router.put('/', async (req, res) => {
  if((await checkExpiry(req, res))){ return res.sendStatus(401) }
  console.log('Debug: Updating author account details');
  if (req.body.data.status === 'Modify an Author') { await updateAuthor(req, res); }
})

module.exports = router;
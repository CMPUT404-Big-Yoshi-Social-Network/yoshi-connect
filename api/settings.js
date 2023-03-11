// Routing
const { getCurrentAuthor } = require('./routes/author');

app.post('/api/settings', async (req, res) => {
    if((await checkExpiry(req, res))){ return res.sendStatus(401) }
    console.log('Debug: Updating author account details');
    if (req.body.data.status === 'Get Author') { await getCurrentAuthor(req, res); }
  })
  
  app.put('/api/settings', async (req, res) => {
    if((await checkExpiry(req, res))){ return res.sendStatus(401) }
    console.log('Debug: Updating author account details');
    if (req.body.data.status === 'Modify an Author') { await updateAuthor(req, res); }
  })
// Routing
const { updateAuthor } = require('../routes/author');
const { removeLogin } = require('../routes/auth');

// OpenAPI
const {options} = require('../openAPI/options.js');

// Swaggerio
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require('swagger-jsdoc');
const openapiSpecification = swaggerJsdoc(options);

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
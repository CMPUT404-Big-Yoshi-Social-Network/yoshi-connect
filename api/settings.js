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

// Router
const router = express.Router({mergeParams: true});

/**
 * @openapi
 * /settings/logout:
 *  post:
 *    description: Removes login document (associated token) and logs out current Author 
 *    responses:
 *      <INSERT>:
 *        description: <INSERT>
 */
router.post('/logout', async (req, res) => { removeLogin(req, res); })

/**
 * @openapi
 * /settings:
 *  post:
 *    description: Modifies an current Author's attributes 
 *    responses:
 *      <INSERT>:
 *        description: <INSERT>
 */
router.put('/', async (req, res) => {
  const status = await updateAuthor(req.cookies.token, req.body.data);
  return res.sendStatus(status);
})

module.exports = router;
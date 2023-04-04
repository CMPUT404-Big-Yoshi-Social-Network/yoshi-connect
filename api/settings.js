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
 *    summary: Removes login document (associated token) and logs out current Author 
 *    tags:
 *      - settings
 *    responses:
 *      500:
 *        description: Internal Server Error, Unable to delete login token from database
 *      200:
 *        description: OK, Login token was succesfully removed from database
 *      401:
 *        description: Unauthorized, Login token is not authenticated
 */
router.post('/logout', async (req, res) => { removeLogin(req, res); })

router.put('/', async (req, res) => {
  const [author, status] = await updateAuthor(req.cookies.token, req.body.data);
  return res.sendStatus(status);
})

module.exports = router;
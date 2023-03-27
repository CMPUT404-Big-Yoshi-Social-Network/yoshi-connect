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

/**
 * @openapi
 * components:
 *   schemas:
 *     SettingsAuthor:
 *         type: object
 *         properties: 
 *           id: 
 *             type: string
 *             description: id of author
 *           username: 
 *             type: string
 *             description: username of Author
 *           email:
 *             type: string
 *             description: email of Author
 *           password:
 *             type: string
 *             description: password of Author
 * /settings:
 *  post:
 *    summary: Modifies an current Author's attributes 
 *    tags:
 *      - settings
 *    requestBody: 
 *      content: 
 *        application/x-www-form-urlencoded:
 *          schema:
 *            - $ref: '#/components/schemas/SettingsAuthor'
 *          example:
 *             SettingsAuthor:
 *               value:
 *                 id: 29c546d45f564a27871838825e3dbecb
 *                 username: kc
 *                 password: 123
 *                 email: ayuno@ualberta.ca
 *    responses:
 *      401:
 *        description: Unauthourized, Author's token is not authenticated 
 *      404:
 *        description: Not Found, Author was not found
 *      200:
 *        description: OK, Returns the sanitized Author
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                type:
 *                  type: string
 *                  description: JSON type 
 *                  example: author
 *                id:
 *                  type: string
 *                  description: URL of Author
 *                  example: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *                authorId:
 *                  type: string 
 *                  description: UUID of Author 
 *                  example: 29c546d45f564a27871838825e3dbecb
 *                host: 
 *                  type: string
 *                  description: network the Author is from 
 *                  example: https://yoshi-connect.herokuapp.com/
 *                url: 
 *                  type: string
 *                  description: URL of Author 
 *                  example: https://yoshi-connect.herokuapp.com/authors/29c546d45f564a27871838825e3dbecb
 *                displayName:
 *                  type: string
 *                  description: username of Author (unique)
 *                  example: kc
 *                about: 
 *                  type: string
 *                  description: description about Author 
 *                  example: i am a code monkey
 *                pronouns:
 *                  type: string
 *                  description: pronouns the Author takes
 *                  example: she/her
 *                github:
 *                  type: string
 *                  description: GitHub linked to the Author
 *                  example: https://github.com/kezzayuno
 *                profileImage:
 *                  type: string
 *                  description: profile picture Author uses
 *                  example: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkIAAADIhkjhaDjkdHfkaSd
 */
router.put('/', async (req, res) => {
  const status = await updateAuthor(req.cookies.token, req.body.data);
  return res.sendStatus(status);
})

module.exports = router;
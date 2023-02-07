const express = require('express');
const router = express.Router();

router.use(express.static('public/test')) // rendering static pages

router.get('/',(request, response) => {
    console.log("Debug: GET test")
    response.render("index")
});

router.get('/test',(request, response) => {
    console.log("Debug: GET test/test")
    response.send("Testing twice.")
});

module.exports = router
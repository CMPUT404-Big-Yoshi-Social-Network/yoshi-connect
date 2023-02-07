const express = require('express');
const router = express.Router();

router.get('/',(request, response) => {
    console.log("Debug: GET test")
    response.send("Testing.")
});

router.get('/test',(request, response) => {
    console.log("Debug: GET test/test")
    response.send("Testing twice.")
});

module.exports = router
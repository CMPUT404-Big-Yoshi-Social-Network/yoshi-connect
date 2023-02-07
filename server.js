const express = require('express');
const app = express();

app.use(express.static(__dirname + '/pages'));

app.get('/',(request, response) => {
    console.log("Debug: GET")
    response.render("index")
});

app.listen(8080);
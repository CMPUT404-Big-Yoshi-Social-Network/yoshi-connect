const express = require('express');
const app = express();

app.use(express.static('public')) // rendering static pages

// Homepage 
app.get('/',(request, response) => {
    console.log("Debug: GET")
    response.render("index")
});

// Test Router
const testRouter = require('./routes/test')
app.use('/test', testRouter)

app.listen(8080);
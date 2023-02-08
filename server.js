const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static('yoshi-react/public')); // rendering static pages

// Test Router
const testRouter = require('./routes/test');
app.use('/test', testRouter);

// Homepage 
app.get('/',(request, response) => {
    console.log("Debug: GET");
    response.render("index");
});

// Test post request
app.post("/post", (req, res) => {
    console.log("Connected to React");
    res.redirect("/");
  });


app.listen(PORT, console.log(`Server listening on port ${PORT}`));

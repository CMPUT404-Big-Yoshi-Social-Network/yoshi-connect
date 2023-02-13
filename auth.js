const crypto_js = require('crypto-js')

function authorExists(req, res, next) {
    console.log('Debug: Checking if the Author exists or not.')
    console.log(req.author)
    if (req.author == null) {
        res.status(403);
        return res.send('You need to sign in to see anything else!')
    }
}

async function authAuthor(req, res) {
    const { getAuthor } = require('./server');
    const username = req.body.username;
    const password = req.body.password;
    if(!username || !password){
        console.log("Authentication failed");
        res.send("Login missing either username or password");
        return;
    }

    const possible_author = await getAuthor(req, res);
    if(!possible_author){
        console.log("Authentication failed");
        res.send("Login Unsuccessful");
    }
    const p_hashed_password = req.author.password;
    console.log("Server's model: ", req.author);
    console.log("Server's Hashed password: ", p_hashed_password)
    console.log("Client's Hashed password: ", crypto_js.SHA256(password))
    if(p_hashed_password == crypto_js.SHA256(password)){
        console.log("Authentication successful");
        return;
    }
    return;
}

async function authAdmin(req, res) {
    const { getAuthor } = require('./server');
    console.log('Debug: Checking if the admin header is true for the user.')

    const possible_author = await getAuthor(req, res);

    if(!possible_author){
        console.log("Authentication failed");
        res.send("Admin access Unsuccessful");
    }

    if (!req.author.admin) {
        res.status(401) // 401 Unauthorized 
        return res.send('You are not an admin!');
    } else {
        res.status(301) // Bad route?
        res.redirect('/admin/dashboard.html');
    }
}

module.exports = {
    authAuthor,
    authAdmin,
    authorExists
}
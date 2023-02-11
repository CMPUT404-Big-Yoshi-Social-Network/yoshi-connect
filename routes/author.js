
const crypto_js = require('crypto-js')

async function register_author(req, res){
    const { getAuthor } = require('../server');
    if(await getAuthor(req, res)){
        res.send("Unsuccessful, User Registration Incomplete");
        return;
    }

    const author_id = (await Author.find().sort({authorId:-1}).limit(1))[0].authorId + 1;

    //Check to make sure username, password, and email are present
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    if( !username || !email || !password ){
        res.send("Unsuccessful, User Registration Incomplete");
        return;
    }

    var author = new Author({
        authorId: author_id,
        username: username,
        password: crypto_js.SHA256(password),
        email: email,
        about: "To be added",
        pronouns: "None/Specified",
        admin: false
    });

    author.save((err, author) => {
        if(err){
            console.log(err);
            return;
        }
        console.log(author.username + " added successfully to database");
        res.send("Successful, User Registration Complete")
    });
    //TODO: Send a JWT or other form of authentication to the client
}

module.exports={
    register_author
}
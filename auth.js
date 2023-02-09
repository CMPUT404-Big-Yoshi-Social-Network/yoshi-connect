function authAuthor(req, res, next) {
    if (req.author == null) {
        console.log('Debug: Author does not exist.')
        res.status(403) // 403 Forbidden 
        return res.send('I am sorry but you are not allowed to see this. Please try to sign up or sign in!')
    }
    next()
}

function authAdmin(adminToken) {
    return (req, res, next) => {
        console.log('Debug: Checking if the user has an admin token.')
        // TODO: Query from the database the admin keys and see if the user has a valid admin key: req.author.adminToken != null
        if (req.author.adminToken == null) {
            res.status(401) // 401 Unauthorized 
            return res.send('You are not an admin!')
        }
        next()
    }
}

module.exports = {
    authAuthor,
    authAdmin
}
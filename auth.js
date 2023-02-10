function authAuthor(req, res, next) {
    console.log(req.body)
    /*If username and password match
    *   Allow them in
    * Else
    *   Return to login with incorrect login
    */
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
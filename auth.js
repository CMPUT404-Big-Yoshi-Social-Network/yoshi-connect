function authAuthor(req, res, next) {
    console.log(req.body)
    /*If username and password match
    *   Allow them in
    * Else
    *   Return to login with incorrect login
    */
    next()
}

function authAdmin(isAdmin) {
    return (req, res, next) => {
        console.log('Debug: Checking if the admin header is true for the user.')
        // TODO: Query from the database the admin keys and see if the user has a admin: true
        if (req.author.admin == false) {
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
function authAuthor(req, res, next) {
    if (req.author == null) {
        console.log('Debug: Author does not exist.')
        res.status(403) // 403 Forbidden 
        return res.send('I am sorry but you are not allowed to see this. Please try to sign up or sign in!')
    }
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
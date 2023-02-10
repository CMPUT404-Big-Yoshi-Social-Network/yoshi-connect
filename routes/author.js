const { getAuthor } = require('../server')

function create_user(req, res){
    getAuthor(req);
}

module.exports={
    create_user
}
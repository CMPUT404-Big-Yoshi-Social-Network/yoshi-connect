const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Yoshi Connect - API',
            description: 'This is the documentation for Yoshi Connect API endpoints',
            license: {
                'name': 'Apache 2.0',
                'identifier': "Apache-2.0"
            }
        }
    },
    apis: [
        './server.js',
        './openAPI/components.js'
    ],
};

module.exports={
    options
}
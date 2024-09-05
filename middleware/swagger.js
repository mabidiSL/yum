const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'infinit',
      version: '1.0.0',
      description: 'API documentation',
    },
    servers: [
      {
          url: 'https://rad-slrad.koyeb.app/',
      },
  ],
  },
  apis: ['./routes/*.js'], // Path to the API routes
};
const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
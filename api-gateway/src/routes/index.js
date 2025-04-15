/**
 * Routes configuration for the API Gateway
 * Each route defines a path and target service
 */

const routes = [
  {
    path: '/api/inventory',
    target: 'http://localhost:3001',
    pathRewrite: {
      '^/api/inventory': '/api/inventory', // No rewrite needed as paths match
    },
  },
  // Add more service routes here as needed
];

module.exports = routes;

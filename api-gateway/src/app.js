const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { createProxyMiddleware } = require('http-proxy-middleware');
const authMiddleware = require('./middleware/auth.middleware');
const routesConfig = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'api-gateway' });
});

// Apply routes from configuration
routesConfig.forEach(route => {
  app.use(
    route.path,
    authMiddleware,
    createProxyMiddleware({
      target: route.target,
      changeOrigin: true,
      pathRewrite: route.pathRewrite || {},
      onProxyReq: (proxyReq, req, res) => {
        // Add any request transformations here
        proxyReq.setHeader('X-Forwarded-By', 'API Gateway');
      },
      onProxyRes: (proxyRes, req, res) => {
        // Add any response transformations here
        proxyRes.headers['X-Powered-By'] = 'API Gateway';
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).json({
          error: true,
          message: 'Service unavailable',
        });
      },
    })
  );
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;

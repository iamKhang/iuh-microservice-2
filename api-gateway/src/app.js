const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { createProxyMiddleware } = require('http-proxy-middleware');
const authMiddleware = require('./middleware/auth.middleware');
const createCircuitBreakerMiddleware = require('./middleware/circuit-breaker.middleware');
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

// Circuit breaker status endpoint
app.get('/circuit-status', (req, res) => {
    // Get circuit breaker module to access the circuitBreakers map
    const circuitBreakerModule = require('./middleware/circuit-breaker.middleware');

    // Get all circuit breakers and their statuses
    const statuses = {};

    // If the module exports the circuitBreakers map
    if (circuitBreakerModule.getCircuitBreakers) {
        const breakers = circuitBreakerModule.getCircuitBreakers();

        breakers.forEach((breaker, serviceName) => {
            statuses[serviceName] = {
                state: breaker.status.state,
                stats: {
                    successful: breaker.stats.successes,
                    failed: breaker.stats.failures,
                    rejected: breaker.stats.rejects,
                    timeout: breaker.stats.timeouts
                }
            };
        });
    }

    res.status(200).json({
        service: 'api-gateway',
        circuitBreakers: statuses
    });
});

// Apply routes from configuration
routesConfig.forEach(route => {
    // Extract service name from the route path
    const serviceName = route.path.split('/')[2] || 'unknown-service';

    app.use(
        route.path,
        authMiddleware,
        // Apply circuit breaker before proxying
        createCircuitBreakerMiddleware(serviceName),
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
                console.error(`Proxy error for ${serviceName}:`, err);
                // Only send response if headers haven't been sent yet
                if (!res.headersSent) {
                    res.status(500).json({
                        error: true,
                        message: 'Service unavailable',
                        service: serviceName
                    });
                }
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
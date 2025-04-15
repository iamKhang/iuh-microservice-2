/**
 * Simple authentication middleware
 * In a real application, this would validate tokens, API keys, etc.
 */

const authMiddleware = (req, res, next) => {
  // For demonstration purposes, we're just adding a header
  // In a real application, you would validate tokens, API keys, etc.
  
  // Add user info to request for downstream services
  req.headers['X-User-Id'] = 'demo-user';
  
  // Log the request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  
  // Continue to the next middleware
  next();
};

module.exports = authMiddleware;

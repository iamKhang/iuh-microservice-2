/**
 * Circuit Breaker middleware
 * Prevents cascading failures by stopping requests to failing services
 */

const CircuitBreaker = require('opossum');

// Store circuit breakers for different services
const circuitBreakers = new Map();

// Circuit Breaker options
const options = {
    failureThreshold: 50, // When 50% of requests fail, trip the circuit
    resetTimeout: 10000, // After 10 seconds, try again
    timeout: 3000, // If function takes longer than 3 seconds, count as failure
    errorThresholdPercentage: 50, // Error percentage threshold to trip circuit
    rollingCountTimeout: 60000, // Time window for failure percentage calculation
    rollingCountBuckets: 10, // Number of buckets for rolling stats
    capacity: 3, // Maximum number of concurrent requests
    volumeThreshold: 3 // Minimum number of requests before tripping circuit
};

// Create a circuit breaker for a service if it doesn't exist
const getCircuitBreaker = (serviceName, serviceFunction) => {
    if (!circuitBreakers.has(serviceName)) {
        const breaker = new CircuitBreaker(serviceFunction, options);

        // Event listeners for logging and monitoring
        breaker.on('open', () => {
            console.log(`Circuit Breaker for ${serviceName} is now OPEN (failing)`);
        });

        breaker.on('close', () => {
            console.log(`Circuit Breaker for ${serviceName} is now CLOSED (working)`);
        });

        breaker.on('halfOpen', () => {
            console.log(`Circuit Breaker for ${serviceName} is now HALF-OPEN (testing)`);
        });

        breaker.on('fallback', (result) => {
            console.log(`Circuit Breaker for ${serviceName} fallback executed`);
        });

        circuitBreakers.set(serviceName, breaker);
    }

    return circuitBreakers.get(serviceName);
};

// Middleware factory function
const createCircuitBreakerMiddleware = (serviceName) => {
    return (req, res, next) => {
        // Create a function that will call next() when executed
        const serviceCall = () => {
            return new Promise((resolve, reject) => {
                // Store the original end method
                const originalEnd = res.end;

                // Override the end method to capture the response
                res.end = function(...args) {
                    // If status code is 5xx, consider it a failure
                    if (res.statusCode >= 500) {
                        reject(new Error(`Service ${serviceName} failed with status ${res.statusCode}`));
                    } else {
                        resolve();
                    }

                    // Call the original end method
                    return originalEnd.apply(this, args);
                };

                // Continue to the next middleware
                next();
            });
        };

        // Get or create a circuit breaker for this service
        const breaker = getCircuitBreaker(serviceName, serviceCall);

        // Define fallback function when circuit is open
        const fallback = () => {
            console.log(`Circuit is open for ${serviceName}, returning fallback response`);
            res.status(503).json({
                error: true,
                message: `Service ${serviceName} is currently unavailable. Please try again later.`,
                circuitBreaker: {
                    state: breaker.status.state,
                    stats: {
                        successful: breaker.stats.successes,
                        failed: breaker.stats.failures,
                        rejected: breaker.stats.rejects,
                        timeout: breaker.stats.timeouts
                    }
                }
            });
        };

        // Execute the request through the circuit breaker
        breaker.fire()
            .catch(err => {
                // If we get here, the circuit is closed but the request failed
                console.error(`Error in circuit breaker for ${serviceName}:`, err.message);

                // Only send a response if one hasn't been sent already
                if (!res.headersSent) {
                    res.status(500).json({
                        error: true,
                        message: 'An error occurred while processing your request'
                    });
                }
            });
    };
};

// Export the middleware factory function and a method to get all circuit breakers
module.exports = createCircuitBreakerMiddleware;
module.exports.getCircuitBreakers = () => circuitBreakers;
/**
 * Extremely Simple Retry Middleware - Guaranteed 3 retries
 */
const createRetryMiddleware = (options = {}) => {
    // Default options
    const retryOptions = {
        maxRetries: 3,
        retryDelay: 1000,
        exponentialBackoff: true
    };

    // Merge with provided options
    Object.assign(retryOptions, options);

    return (req, res, next) => {
        // Create a unique ID for this request to track it in logs
        const requestId = Math.random().toString(36).substring(2, 15);

        // Track retry state
        const state = {
            retryCount: 0,
            originalUrl: req.originalUrl,
            originalMethod: req.method,
            isRetrying: false
        };

        // Store original methods
        const originalEnd = res.end;
        const originalWrite = res.write;

        // Calculate delay with exponential backoff
        const getRetryDelay = () => {
            if (retryOptions.exponentialBackoff) {
                return retryOptions.retryDelay * Math.pow(2, state.retryCount);
            }
            return retryOptions.retryDelay;
        };

        // Function to perform retry
        const performRetry = () => {
            // Prevent multiple retries at once
            if (state.isRetrying) {
                console.log(`[Retry:${requestId}] Already retrying, skipping additional retry`);
                return;
            }

            state.isRetrying = true;
            state.retryCount++;
            const delay = getRetryDelay();

            console.log(`[Retry:${requestId}] Attempt ${state.retryCount}/${retryOptions.maxRetries} for ${state.originalMethod} ${state.originalUrl} - Retrying in ${delay}ms`);

            // Schedule retry
            setTimeout(() => {
                console.log(`[Retry:${requestId}] Executing retry attempt ${state.retryCount} for ${state.originalMethod} ${state.originalUrl}`);

                // Reset response
                res.statusCode = 200;
                res.statusMessage = '';
                res.headersSent = false;

                // Restore original methods
                res.write = originalWrite;
                res.end = originalEnd;

                // Reset retry flag
                state.isRetrying = false;

                // Continue to next middleware (retry the request)
                next();
            }, delay);
        };

        // Override end method to intercept response
        res.end = function() {
            // Always retry on error status codes (4xx, 5xx)
            const isErrorStatus = res.statusCode >= 400;
            const canRetry = state.retryCount < retryOptions.maxRetries;

            if (isErrorStatus && canRetry) {
                console.log(`[Retry:${requestId}] Request ${state.originalMethod} ${state.originalUrl} failed with status ${res.statusCode}`);
                performRetry();
            } else {
                // Log completion
                if (state.retryCount > 0) {
                    if (res.statusCode >= 400) {
                        console.log(`[Retry:${requestId}] Request ${state.originalMethod} ${state.originalUrl} still failed after ${state.retryCount} retries with status ${res.statusCode}`);
                    } else {
                        console.log(`[Retry:${requestId}] Request ${state.originalMethod} ${state.originalUrl} succeeded after ${state.retryCount} retries`);
                    }
                }

                // Restore original end method and call it
                res.end = originalEnd;
                return originalEnd.apply(this, arguments);
            }
        };

        // Continue to next middleware
        next();
    };
};

module.exports = createRetryMiddleware;
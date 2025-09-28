import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate limiter configuration
const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'legalmind_api',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
  blockDuration: 60, // Block for 60 seconds if limit exceeded
});

// Rate limiter middleware
export const rateLimiterMiddleware = async (req, res, next) => {
  try {
    const key = req.ip || 'unknown';
    await rateLimiter.consume(key);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${secs} seconds.`,
      retryAfter: secs
    });
  }
};

// Stricter rate limiter for AI endpoints
const aiRateLimiter = new RateLimiterMemory({
  keyPrefix: 'legalmind_ai',
  points: 20, // Fewer requests for AI endpoints
  duration: 60,
  blockDuration: 300, // Block for 5 minutes
});

export const aiRateLimiterMiddleware = async (req, res, next) => {
  try {
    const key = req.ip || 'unknown';
    await aiRateLimiter.consume(key);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      error: 'AI Rate Limit Exceeded',
      message: `AI endpoint rate limit exceeded. Try again in ${secs} seconds.`,
      retryAfter: secs
    });
  }
};

// Default rate limiter (less strict)
export { rateLimiterMiddleware as rateLimiter };
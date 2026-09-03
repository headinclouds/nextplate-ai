// Simple in-memory rate limiter
// Note: Resets on server restart. For production, consider Redis-based solution.

const requestMap = new Map();

// Cleanup old entries every 10 minutes
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, requests] of requestMap.entries()) {
    const validRequests = requests.filter((time) => now - time < 3600000);
    if (validRequests.length === 0) {
      requestMap.delete(key);
    } else {
      requestMap.set(key, validRequests);
    }
  }
}, 600000);

// Avoid keeping the Node event loop alive in test/runtime shutdown.
if (typeof cleanupInterval.unref === 'function') {
  cleanupInterval.unref();
}

export function checkRateLimit(identifier, maxRequests = 15, windowMs = 3600000) {
  const now = Date.now();
  const userRequests = requestMap.get(identifier) || [];

  // Filter requests within the time window
  const recentRequests = userRequests.filter((time) => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: new Date(recentRequests[0] + windowMs),
    };
  }

  // Add current request
  recentRequests.push(now);
  requestMap.set(identifier, recentRequests);

  return {
    success: true,
    remaining: maxRequests - recentRequests.length,
    resetTime: new Date(now + windowMs),
  };
}

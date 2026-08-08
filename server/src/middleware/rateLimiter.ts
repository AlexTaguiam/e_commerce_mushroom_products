import rateLimit from "express-rate-limit";

// Global rate limiter for general API endpoints
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  statusCode: 429,
  // Standardized JSON response format
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes.",
  },
  // Ensure precise IP extraction
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || "unknown-ip";
  },
});

// Stricter rate limiter for authentication endpoints (login, register, password reset)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: {
    success: false,
    message:
      "Too many authentication attempts from this IP, please try again after 15 minutes.",
  },
  // Optional: Only count failed attempts towards the limit so successful logins aren't penalized
  // skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || "unknown-ip";
  },
});

import { rateLimit } from "express-rate-limit";

// Strict limiter for sensitive auth endpoints (login, signup, forgot-password)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: {
        message: "Too many requests from this IP. Please try again after 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Only count FAILED attempts (wrong password etc.)
});

// Lenient limiter for Google OAuth — redirects count as "requests" so needs higher ceiling
export const oauthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        message: "Too many OAuth requests. Please try again after 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
});

// General API limiter — all other routes
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        message: "Too many requests from this IP. Please try again after 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Only count failed requests against the limit
});

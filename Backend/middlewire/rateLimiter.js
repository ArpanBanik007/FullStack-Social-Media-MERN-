// middleware/rateLimiter.js
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// Message send — per user 60/minute
export const messageLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    keyGenerator: (req, res) => req.user?._id?.toString() || ipKeyGenerator(req, res),
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: "Too many messages. Please slow down.",
            retryAfter: 60,
        });
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Auth routes — IP based 10/15min (brute force থেকে বাঁচাও)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: "Too many attempts. Try again after 15 minutes.",
        });
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Search — 30/minute
export const searchLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    keyGenerator: (req, res) => req.user?._id?.toString() || ipKeyGenerator(req, res),
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: "Too many search requests.",
        });
    },
});
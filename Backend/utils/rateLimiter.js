import rateLimit from "express-rate-limit";

export const shareLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: "Too many share requests, slow down" },
});
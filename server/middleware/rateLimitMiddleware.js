const rateLimit = require("express-rate-limit");

const isDev = process.env.NODE_ENV !== "production";

// In development skip rate limiting entirely — StrictMode double-invokes
// effects and multiple components mount simultaneously, exhausting limits fast.
const noopMiddleware = (_req, _res, next) => next();

const apiLimiter = isDev
  ? noopMiddleware
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 500,
      standardHeaders: true,
      legacyHeaders: false,
      message: { message: "Too many requests, please try again later." },
    });

const authLimiter = isDev
  ? noopMiddleware
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 20,
      standardHeaders: true,
      legacyHeaders: false,
      message: { message: "Too many auth attempts, please try again later." },
    });

module.exports = { apiLimiter, authLimiter };

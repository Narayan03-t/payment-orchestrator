const rateLimit = require("express-rate-limit");

const rateLimitHandler = (request, response) => {
  return response.status(429).json({
    error: "Too many requests, please slow down",
  });
};

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

module.exports = {
  apiLimiter,
  paymentLimiter,
};

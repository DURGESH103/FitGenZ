const xssClean = require("xss-clean");

const xssMiddleware = (req, res, next) => {
  try {
    return xssClean()(req, res, next);
  } catch (_err) {
    return next();
  }
};

module.exports = xssMiddleware;

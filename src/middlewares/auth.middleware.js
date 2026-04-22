const jwt = require("jsonwebtoken");
const env = require("../config/env");
const HttpError = require("../utils/http-error");
const logger = require("../utils/logger");

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new HttpError(401, "Unauthorized"));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = payload;
    return next();
  } catch (error) {
    logger.warn({ err: error, path: req.originalUrl }, "JWT authentication failure");
    return next(new HttpError(401, "Invalid or expired token"));
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new HttpError(403, "Forbidden"));
    }
    return next();
  };
}

module.exports = {
  authenticate,
  authorize,
};


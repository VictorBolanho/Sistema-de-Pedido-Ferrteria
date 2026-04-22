const HttpError = require("../utils/http-error");
const logger = require("../utils/logger");

function notFoundHandler(req, res) {
  res.status(404).json({ message: "Route not found" });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof HttpError) {
    logger.warn({ err: error, path: req.originalUrl, method: req.method }, "HttpError returned");
    const payload = { message: error.message };
    if (error.details) {
      payload.details = error.details;
    }
    return res.status(error.statusCode).json(payload);
  }

  if (error.name === "ZodError") {
    logger.warn({ err: error, path: req.originalUrl, method: req.method }, "Validation error");
    const details = error.errors.map((err) => ({ path: err.path.join("."), message: err.message }));
    return res.status(400).json({ message: "Validation error", details });
  }

  logger.error({ err: error, path: req.originalUrl, method: req.method }, "Unhandled error");
  return res.status(500).json({ message: "Internal server error" });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};


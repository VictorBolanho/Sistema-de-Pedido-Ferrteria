const pino = require("pino");
const env = require("../config/env");

const logger = pino({
  level: env.nodeEnv === "development" ? "debug" : "info",
});

module.exports = logger;

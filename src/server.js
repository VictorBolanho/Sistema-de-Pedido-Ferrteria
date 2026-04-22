const app = require("./app");
const env = require("./config/env");
const { pool } = require("./config/database");
const logger = require("./utils/logger");

const server = app.listen(env.port, () => {
  logger.info({ port: env.port }, "API listening on port");
});

function shutdown(signal) {
  logger.info({ signal }, "Shutdown initiated");
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));


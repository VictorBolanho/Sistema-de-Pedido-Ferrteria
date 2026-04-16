const app = require("./app");
const env = require("./config/env");
const { pool } = require("./config/database");

const server = app.listen(env.port, () => {
  console.log(`API listening on port ${env.port}`);
});

function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));


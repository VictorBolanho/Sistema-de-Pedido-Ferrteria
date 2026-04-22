const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middlewares/error.middleware");
const logger = require("./utils/logger");

const app = express();

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

app.use(helmet());
app.use(cors());
app.use(morgan("dev", { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/api/v1", apiLimiter);

app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;


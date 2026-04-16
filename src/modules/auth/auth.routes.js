const express = require("express");
const authController = require("./auth.controller");
const { authenticate } = require("../../middlewares/auth.middleware");

const router = express.Router();

router.post("/login", authController.login);
router.post("/bootstrap-admin", authController.bootstrapAdmin);
router.get("/me", authenticate, authController.me);

module.exports = router;


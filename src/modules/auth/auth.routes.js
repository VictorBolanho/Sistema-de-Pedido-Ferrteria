const express = require("express");
const rateLimit = require("express-rate-limit");
const authController = require("./auth.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again later." },
});

router.post("/login", loginLimiter, authController.login);
router.post("/forgot-password", authController.requestPasswordReset);
router.post("/reset-password", authController.resetPassword);
router.post("/bootstrap-admin", authController.bootstrapAdmin);
router.post("/advisor", authenticate, authorize("admin"), authController.createAdvisor);
router.get("/advisors", authenticate, authorize("admin"), authController.getAdvisors);
router.patch("/advisor/:id/status", authenticate, authorize("admin"), authController.updateAdvisorStatus);
router.delete("/advisor/:id", authenticate, authorize("admin"), authController.deleteAdvisor);
router.get("/me", authenticate, authController.me);

module.exports = router;

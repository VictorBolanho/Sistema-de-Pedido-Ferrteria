const express = require("express");
const authController = require("./auth.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");

const router = express.Router();

router.post("/login", authController.login);
router.post("/bootstrap-admin", authController.bootstrapAdmin);
router.post("/advisor", authenticate, authorize("admin"), authController.createAdvisor);
router.get("/advisors", authenticate, authorize("admin"), authController.getAdvisors);
router.delete("/advisor/:id", authenticate, authorize("admin"), authController.deleteAdvisor);
router.get("/me", authenticate, authController.me);

module.exports = router;


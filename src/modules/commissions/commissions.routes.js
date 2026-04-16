const express = require("express");
const commissionsController = require("./commissions.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");

const router = express.Router();

router.use(authenticate);
router.get("/", authorize("admin", "advisor"), commissionsController.getCommissions);

module.exports = router;


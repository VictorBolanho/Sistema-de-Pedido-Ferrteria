const express = require("express");
const clientsController = require("./clients.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.post("/", authorize("admin", "advisor"), clientsController.createClient);
router.get("/", authorize("admin", "advisor"), clientsController.getClients);
router.get("/:id", authorize("admin", "advisor"), clientsController.getClientById);
router.patch(
  "/:id/assign-advisor",
  authorize("admin"),
  clientsController.assignAdvisor
);

module.exports = router;


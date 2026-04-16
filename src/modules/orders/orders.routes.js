const express = require("express");
const ordersController = require("./orders.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.post("/", authorize("client"), ordersController.createOrder);
router.get("/", authorize("admin", "advisor", "client"), ordersController.getOrders);
router.get("/:id", authorize("admin", "advisor", "client"), ordersController.getOrderById);
router.patch("/:id/status", authorize("admin"), ordersController.updateOrderStatus);

module.exports = router;


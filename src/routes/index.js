const express = require("express");
const authRoutes = require("../modules/auth/auth.routes");
const clientsRoutes = require("../modules/clients/clients.routes");
const productsRoutes = require("../modules/products/products.routes");
const ordersRoutes = require("../modules/orders/orders.routes");
const commissionsRoutes = require("../modules/commissions/commissions.routes");
const accessRequestsRoutes = require("../modules/access-requests/access-requests.routes");
const uploadRoutes = require("../modules/uploads/upload.routes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/access-requests", accessRequestsRoutes);
router.use("/upload", uploadRoutes);
router.use("/clients", clientsRoutes);
router.use("/products", productsRoutes);
router.use("/orders", ordersRoutes);
router.use("/commissions", commissionsRoutes);

module.exports = router;

const express = require("express");
const productsController = require("./products.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.post("/", authorize("admin"), productsController.createProduct);
router.post("/bulk", authorize("admin"), productsController.bulkCreateProducts);
router.get("/", productsController.getProducts);
router.get("/:id", productsController.getProductById);
router.patch("/:id", authorize("admin"), productsController.updateProduct);

module.exports = router;


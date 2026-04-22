const express = require("express");
const productsController = require("./products.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");

const router = express.Router();

router.post("/", authenticate, authorize("admin"), productsController.createProduct);
router.post("/bulk", authenticate, authorize("admin"), productsController.bulkCreateProducts);
router.get("/", productsController.getProducts);
router.get("/:id", productsController.getProductById);
router.patch("/:id/stock", authenticate, authorize("admin"), productsController.updateProductStock);
router.patch("/:id/status", authenticate, authorize("admin"), productsController.updateProductStatus);
router.put("/:id", authenticate, authorize("admin"), productsController.updateProduct);
router.delete("/:id", authenticate, authorize("admin"), productsController.deleteProduct);
router.patch("/:id", authenticate, authorize("admin"), productsController.updateProduct);

module.exports = router;


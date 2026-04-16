const express = require("express");
const multer = require("multer");
const router = express.Router();
const accessRequestsController = require("./access-requests.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");

// Configure multer for file uploads (memory storage for simplicity)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Allow PDF and image files
    const allowedMimes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and image files are allowed"));
    }
  }
});

// Public endpoint - anyone can submit
router.post("/", upload.fields([
  { name: "rut_file", maxCount: 1 },
  { name: "chamber_file", maxCount: 1 },
  { name: "id_file", maxCount: 1 }
]), accessRequestsController.submitRequest);

// Admin endpoints - require authentication
router.get("/", authenticate, authorize("admin"), accessRequestsController.getRequests);
router.patch("/:id/approve", authenticate, authorize("admin"), accessRequestsController.approveRequest);
router.patch("/:id/reject", authenticate, authorize("admin"), accessRequestsController.rejectRequest);

module.exports = router;

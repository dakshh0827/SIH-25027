// routes/manufacturingRoutes.js - Updated with QR integration
import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  createManufacturingReport,
  getManufacturingHistory,
  getManufacturerQRHistory,
} from "../controllers/manufacturingController.js";

const router = express.Router();

// All routes are protected and authorized for manufacturers only
router.use(protect);
router.use(authorize("manufacturer"));

// Manufacturing report routes
router.post("/", createManufacturingReport);
router.get("/history", getManufacturingHistory);
router.get("/qr-history", getManufacturerQRHistory);

export default router;

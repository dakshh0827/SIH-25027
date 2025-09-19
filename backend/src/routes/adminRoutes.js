// routes/adminRoutes.js
import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  getAllHarvestReports,
  getAllManufacturingReports,
  getAllLabReports,
  getSystemStats
} from "../controllers/adminController.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize("admin"));

// Get all harvest reports
router.get("/harvests", getAllHarvestReports);

// Get all manufacturing reports
router.get("/manufacturing_reports", getAllManufacturingReports);

// Get all lab reports
router.get("/lab_reports", getAllLabReports);

// Get system statistics
router.get("/stats", getSystemStats);

export default router;
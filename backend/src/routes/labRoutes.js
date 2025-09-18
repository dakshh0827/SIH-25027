// routes/labRoutes.js
import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import upload from "../middleware/multerMiddleware.js";
import { labReportSchema } from "../utils/validationSchemas.js";
import {
  createLabReport,
  getLabHistory,
} from "../controllers/labController.js";

const router = express.Router();

// Lab report creation route with proper middleware order
router.post(
  "/",
  protect,
  authorize("lab"),
  upload.single("labReportFile"), // Handle file upload first
  validate(labReportSchema), // Then validate the form data
  createLabReport
);

// Get lab history route
router.get("/", protect, authorize("lab"), getLabHistory);

export default router;
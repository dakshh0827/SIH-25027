// routes/manufacturingRoutes.js
import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { manufacturingReportSchema } from "../utils/validationSchemas.js";
import {
  createManufacturingReport,
  getManufacturingHistory,
} from "../controllers/manufacturingController.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("manufacturer"),
  validate(manufacturingReportSchema),
  createManufacturingReport
);

router.get("/", protect, authorize("manufacturer"), getManufacturingHistory);

export default router;

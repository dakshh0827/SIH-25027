// routes/manufacturingRoutes.js
import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { manufacturingReportSchema } from "../utils/validationSchemas.js";
import { createManufacturingReport } from "../controllers/manufacturingController.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("manufacturer"),
  validate(manufacturingReportSchema),
  createManufacturingReport
);

export default router;

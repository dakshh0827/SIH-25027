// routes/labRoutes.js
import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import upload from "../middleware/multerMiddleware.js";
import { labReportSchema } from "../utils/validationSchemas.js";
import { createLabReport } from "../controllers/labController.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("lab"),
  upload.single("labReportFile"), // file field name in the form
  validate(labReportSchema),
  createLabReport
);

export default router;

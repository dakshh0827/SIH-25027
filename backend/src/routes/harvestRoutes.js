// routes/harvestRoutes.js
import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import upload from "../middleware/multerMiddleware.js";
import { harvestSchema } from "../utils/validationSchemas.js";
import {
  createHarvest,
  getHarvestHistory,
} from "../controllers/harvestController.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("farmer"),
  upload.single("harvestProof"), // file field name in the form
  validate(harvestSchema),
  createHarvest
);

router.get("/", protect, authorize("farmer"), getHarvestHistory);

export default router;

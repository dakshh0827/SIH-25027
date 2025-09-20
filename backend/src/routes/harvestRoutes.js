// routes/harvestRoutes.js - Updated to support multiple field names
import express from "express";
import multer from "multer";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  createHarvest,
  getHarvestHistory,
  getFarmerQRHistory,
  regenerateHarvestQR,
  getHarvestByIdentifier,
  getHarvestIdentifiers,
} from "../controllers/harvestController.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Create upload middleware that accepts multiple possible field names
const uploadHarvestFile = upload.fields([
  { name: "harvestProofImage", maxCount: 1 },
  { name: "harvestProof", maxCount: 1 },
  { name: "image", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

// Alternative: Accept any field name (less secure but more flexible)
// const uploadHarvestFile = upload.any();

// Farmer routes (protected and authorized)
router.post(
  "/",
  protect,
  authorize("farmer"),
  uploadHarvestFile,
  createHarvest
);

router.get("/history", protect, authorize("farmer"), getHarvestHistory);

// QR-specific routes for farmers
router.get("/qr-history", protect, authorize("farmer"), getFarmerQRHistory);

router.post(
  "/regenerate-qr/:identifier",
  protect,
  authorize("farmer"),
  regenerateHarvestQR
);

// Public/cross-role routes for harvest information
router.get("/identifiers", protect, getHarvestIdentifiers);

router.get("/by-identifier/:identifier", protect, getHarvestByIdentifier);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File too large. Maximum size is 10MB.",
      });
    }

    if (error.code === "UNEXPECTED_FIELD") {
      return res.status(400).json({
        message: `Unexpected file field: '${error.field}'. Expected one of: harvestProofImage, harvestProof, image, or file`,
        debug: {
          receivedField: error.field,
          expectedFields: [
            "harvestProofImage",
            "harvestProof",
            "image",
            "file",
          ],
        },
      });
    }
  }

  if (error.message === "Only image files are allowed") {
    return res.status(400).json({
      message: "Only image files are allowed for harvest proof.",
    });
  }

  next(error);
});

export default router;

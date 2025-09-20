// routes/labRoutes.js - Updated with QR integration
import express from "express";
import multer from "multer";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  createLabReport,
  getLabHistory,
  getLabQRHistory,
} from "../controllers/labController.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept most file types for lab reports (PDFs, images, documents)
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Allowed: PDF, JPG, PNG, DOC, DOCX"),
        false
      );
    }
  },
});

// Create upload middleware that accepts multiple possible field names
const uploadLabFile = upload.fields([
  { name: "labReportFile", maxCount: 1 },
  { name: "file", maxCount: 1 },
  { name: "report", maxCount: 1 },
]);

// All routes are protected and authorized for labs only
router.use(protect);
router.use(authorize("lab"));

// Lab report routes
router.post("/", uploadLabFile, createLabReport);
router.get("/history", getLabHistory);
router.get("/qr-history", getLabQRHistory);

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
        message: `Unexpected file field: '${error.field}'. Expected one of: labReportFile, file, or report`,
        debug: {
          receivedField: error.field,
          expectedFields: ["labReportFile", "file", "report"],
        },
      });
    }
  }
  if (error.message.includes("Invalid file type")) {
    return res.status(400).json({
      message: error.message,
    });
  }
  next(error);
});

export default router;

// routes/publicRoutes.js

import express from "express";
import {
  getPublicQRCodes,
  getScannerQRCode,
  getPublicStats,
} from "../controllers/publicController.js";

const router = express.Router();

/**
 * @route   GET /api/public/qr-codes
 * @desc    Get all public QR codes for landing page display
 * @access  Public
 */
router.get("/qr-codes", getPublicQRCodes);

/**
 * @route   GET /api/public/qr/:qrCode/scanner
 * @desc    Generate scannable QR code image for consumer scanning
 * @access  Public
 */
router.get("/qr/:qrCode/scanner", getScannerQRCode);

/**
 * @route   GET /api/public/stats
 * @desc    Get public statistics for landing page
 * @access  Public
 */
router.get("/stats", getPublicStats);

export default router;

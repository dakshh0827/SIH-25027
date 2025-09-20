import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import QRTrackingService from "../services/qrService.js";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @route   GET /report/:qrCode
 * @desc    Generates and serves a PDF report for a public QR code
 * @access  Public
 */
router.get("/report/:qrCode", async (req, res) => {
  try {
    const { qrCode } = req.params;
    const pdfBuffer = await QRTrackingService.generateReportAsPDF(qrCode);

    // Set headers to instruct the browser to open the PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=Report-${qrCode}.pdf`
    );

    // Send the generated PDF
    res.send(pdfBuffer);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || "Could not generate report.",
    });
  }
});

// Get all public QR codes for consumer browsing
router.get("/public", async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const qrCodes = await QRTrackingService.getAllPublicQRs(
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      success: true,
      data: qrCodes,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: qrCodes.length,
      },
    });
  } catch (error) {
    console.error("Error fetching public QR codes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch public QR codes",
    });
  }
});

// Protected routes (authentication required)

// Initialize QR tracker from harvest (called automatically when harvest is created)
router.post("/initialize", protect, authorize("farmer"), async (req, res) => {
  try {
    const { harvestIdentifier } = req.body;

    if (!harvestIdentifier) {
      return res.status(400).json({
        success: false,
        message: "Harvest identifier is required",
      });
    }

    const qrData = await QRTrackingService.initializeFromHarvest(
      harvestIdentifier
    );

    res.status(201).json({
      success: true,
      message: "QR tracker initialized successfully",
      data: qrData,
    });
  } catch (error) {
    console.error("Error initializing QR tracker:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to initialize QR tracker",
    });
  }
});

// Update QR tracker with manufacturing data (called automatically)
router.put(
  "/update-manufacturing",
  protect,
  authorize("manufacturer"),
  async (req, res) => {
    try {
      const { manufacturingReportId } = req.body;

      if (!manufacturingReportId) {
        return res.status(400).json({
          success: false,
          message: "Manufacturing report ID is required",
        });
      }

      const updatedTracker = await QRTrackingService.updateWithManufacturing(
        manufacturingReportId
      );

      res.json({
        success: true,
        message: "QR tracker updated with manufacturing data",
        data: updatedTracker,
      });
    } catch (error) {
      console.error("Error updating QR tracker with manufacturing:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update QR tracker",
      });
    }
  }
);

// Update QR tracker with lab report data (called automatically)
router.put("/update-lab", protect, authorize("lab"), async (req, res) => {
  try {
    const { labReportId } = req.body;

    if (!labReportId) {
      return res.status(400).json({
        success: false,
        message: "Lab report ID is required",
      });
    }

    const updatedTracker = await QRTrackingService.updateWithLabReport(
      labReportId
    );

    res.json({
      success: true,
      message: "QR tracker updated with lab report data",
      data: updatedTracker,
    });
  } catch (error) {
    console.error("Error updating QR tracker with lab report:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update QR tracker",
    });
  }
});

// Make QR tracker public (admin only)
router.put(
  "/make-public/:qrCode",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { qrCode } = req.params;

      const updatedTracker = await QRTrackingService.makePublic(qrCode);

      res.json({
        success: true,
        message: "QR tracker is now public",
        data: updatedTracker,
      });
    } catch (error) {
      console.error("Error making QR tracker public:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to make QR tracker public",
      });
    }
  }
);

// Get QR tracker details (for internal use by farmers/manufacturers/labs)
router.get("/track/:qrCode", protect, async (req, res) => {
  try {
    const { qrCode } = req.params;

    // Allow users to track their own QR codes even if not public
    const qrTracker = await QRTrackingService.getTracker(qrCode, false); // false = don't require public

    res.json({
      success: true,
      data: qrTracker,
    });
  } catch (error) {
    console.error("Error fetching QR tracker:", error);
    res.status(404).json({
      success: false,
      message: error.message || "QR tracker not found",
    });
  }
});

// Role-specific QR history routes

// Get QR history for farmers
router.get(
  "/farmer/history",
  protect,
  authorize("farmer"),
  async (req, res) => {
    try {
      const farmerProfile = await prisma.farmerProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!farmerProfile) {
        return res.status(403).json({
          success: false,
          message: "Farmer profile not found for this user.",
        });
      }

      const qrHistory = await QRTrackingService.getFarmerQRHistory(
        farmerProfile.id
      );

      res.json({
        success: true,
        message: "Farmer QR history retrieved successfully",
        data: qrHistory,
        count: qrHistory.length,
      });
    } catch (error) {
      console.error("Error fetching farmer QR history:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch QR history",
      });
    }
  }
);

// Get QR history for manufacturers
router.get(
  "/manufacturer/history",
  protect,
  authorize("manufacturer"),
  async (req, res) => {
    try {
      const manufacturerProfile = await prisma.manufacturerProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!manufacturerProfile) {
        return res.status(403).json({
          success: false,
          message: "Manufacturer profile not found for this user.",
        });
      }

      const qrHistory = await QRTrackingService.getManufacturerQRHistory(
        manufacturerProfile.id
      );

      res.json({
        success: true,
        message: "Manufacturer QR history retrieved successfully",
        data: qrHistory,
        count: qrHistory.length,
      });
    } catch (error) {
      console.error("Error fetching manufacturer QR history:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch QR history",
      });
    }
  }
);

// Get QR history for labs
router.get("/lab/history", protect, authorize("lab"), async (req, res) => {
  try {
    const laboratoryProfile = await prisma.laboratoryProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!laboratoryProfile) {
      return res.status(403).json({
        success: false,
        message: "Laboratory profile not found for this user.",
      });
    }

    const qrHistory = await QRTrackingService.getLabQRHistory(
      laboratoryProfile.id
    );

    res.json({
      success: true,
      message: "Lab QR history retrieved successfully",
      data: qrHistory,
      count: qrHistory.length,
    });
  } catch (error) {
    console.error("Error fetching lab QR history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch QR history",
    });
  }
});

// Get QR tracker by harvest identifier (for manufacturers/labs to find existing QR)
router.get("/by-harvest/:harvestIdentifier", protect, async (req, res) => {
  try {
    const { harvestIdentifier } = req.params;

    const qrTracker = await QRTrackingService.getTrackerByHarvestIdentifier(
      harvestIdentifier,
      false // Don't require public for internal users
    );

    res.json({
      success: true,
      data: qrTracker,
    });
  } catch (error) {
    console.error("Error fetching QR tracker by harvest identifier:", error);
    res.status(404).json({
      success: false,
      message: error.message || "QR tracker not found for this harvest",
    });
  }
});

// Get all QR trackers for admin
router.get("/admin/all", protect, authorize("admin"), async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const filters = {};
    if (status) filters.status = status;

    const qrTrackers = await QRTrackingService.getAllTrackers(
      filters,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      success: true,
      data: qrTrackers,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: qrTrackers.length,
      },
    });
  } catch (error) {
    console.error("Error fetching QR trackers for admin:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch QR trackers",
    });
  }
});

export default router;

// Add this to your main server file (app.js or server.js):
// app.use('/api/qr', qrRoutes);

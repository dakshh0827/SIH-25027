import express from "express";
import { PrismaClient } from "@prisma/client";
import QRCode from "qrcode";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @route   GET /api/public/qr-codes
 * @desc    Get all public QR codes for landing page display
 * @access  Public
 */
router.get("/qr-codes", async (req, res) => {
  try {
    const { page = 1, limit = 12, search = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search filter
    const searchFilter = search
      ? {
          OR: [
            { productName: { contains: search, mode: "insensitive" } },
            { harvestIdentifier: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    // Get public QR codes with harvest information
    const qrCodes = await prisma.qRTracker.findMany({
      where: {
        isPublic: true,
        status: "PUBLIC",
        ...searchFilter,
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { updatedAt: "desc" },
    });

    // Get harvest details for each QR code
    const enrichedQRCodes = await Promise.all(
      qrCodes.map(async (qr) => {
        const harvest = await prisma.harvest.findUnique({
          where: { identifier: qr.harvestIdentifier },
          include: {
            submittedBy: {
              include: {
                user: {
                  select: { fullName: true, email: true },
                },
              },
            },
          },
        });

        return {
          qrCode: qr.qrCode,
          productName: qr.productName || `${harvest?.herbSpecies} Product`,
          harvestIdentifier: qr.harvestIdentifier,
          herbSpecies: harvest?.herbSpecies || "Unknown Herb",
          harvestLocation: harvest?.location || "Unknown Location",
          harvestWeight: harvest?.harvestWeightKg || 0,
          farmerName: harvest?.submittedBy?.user?.fullName || "Unknown Farmer",
          fpoName: harvest?.submittedBy?.fpoName || "Unknown FPO",
          batchId: qr.batchId,
          status: qr.status,
          createdAt: qr.createdAt,
          updatedAt: qr.updatedAt,
          reportUrl: `/api/qr/report/${qr.qrCode}`,
          scannerImageUrl: `/api/public/qr/${qr.qrCode}/scanner`,
          // Include QR image from stage completions if available
          qrImageUrl: qr.stageCompletions?.qrImageUrl || null,
        };
      })
    );

    // Get total count for pagination
    const totalCount = await prisma.qRTracker.count({
      where: {
        isPublic: true,
        status: "PUBLIC",
        ...searchFilter,
      },
    });

    res.json({
      success: true,
      data: {
        qrCodes: enrichedQRCodes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          hasNext: skip + parseInt(limit) < totalCount,
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching public QR codes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch public QR codes",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/public/qr/:qrCode/scanner
 * @desc    Generate scannable QR code image for consumer scanning
 * @access  Public
 */
router.get("/qr/:qrCode/scanner", async (req, res) => {
  try {
    const { qrCode } = req.params;

    // Verify QR code exists and is public
    const qrTracker = await prisma.qRTracker.findUnique({
      where: { qrCode },
    });

    if (!qrTracker) {
      return res.status(404).json({
        success: false,
        message: "QR code not found",
      });
    }

    if (!qrTracker.isPublic) {
      return res.status(403).json({
        success: false,
        message: "QR code is not public",
      });
    }

    // Create the full URL that the QR code should point to
    const reportUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/report/${qrCode}`;

    // Generate high-quality scannable QR code
    const qrImageBuffer = await QRCode.toBuffer(reportUrl, {
      width: 512,
      margin: 4,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H", // High error correction for reliable scanning
    });

    // Set headers for image response
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", qrImageBuffer.length);
    res.setHeader(
      "Content-Disposition",
      `inline; filename=scanner-qr-${qrCode}.png`
    );
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 1 day

    // Send the QR code image
    res.send(qrImageBuffer);
  } catch (error) {
    console.error("Error generating scanner QR code:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate scanner QR code",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/public/qr/:qrCode/preview
 * @desc    Get basic QR code information for preview cards
 * @access  Public
 */
router.get("/qr/:qrCode/preview", async (req, res) => {
  try {
    const { qrCode } = req.params;

    const qrTracker = await prisma.qRTracker.findUnique({
      where: { qrCode },
    });

    if (!qrTracker || !qrTracker.isPublic) {
      return res.status(404).json({
        success: false,
        message: "QR code not found or not public",
      });
    }

    // Get harvest information
    const harvest = await prisma.harvest.findUnique({
      where: { identifier: qrTracker.harvestIdentifier },
      include: {
        submittedBy: {
          include: {
            user: {
              select: { fullName: true },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        qrCode: qrTracker.qrCode,
        productName: qrTracker.productName || `${harvest?.herbSpecies} Product`,
        harvestIdentifier: qrTracker.harvestIdentifier,
        herbSpecies: harvest?.herbSpecies || "Unknown Herb",
        farmerName: harvest?.submittedBy?.user?.fullName || "Unknown Farmer",
        status: qrTracker.status,
        reportUrl: `/api/qr/report/${qrCode}`,
        scannerImageUrl: `/api/public/qr/${qrCode}/scanner`,
      },
    });
  } catch (error) {
    console.error("Error fetching QR preview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch QR preview",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/public/stats
 * @desc    Get public statistics for landing page
 * @access  Public
 */
router.get("/stats", async (req, res) => {
  try {
    const [
      totalPublicQRs,
      totalHarvests,
      totalFarmers,
      totalManufacturers,
      totalLabs,
    ] = await Promise.all([
      prisma.qRTracker.count({ where: { isPublic: true } }),
      prisma.harvest.count(),
      prisma.farmerProfile.count(),
      prisma.manufacturerProfile.count(),
      prisma.laboratoryProfile.count(),
    ]);

    res.json({
      success: true,
      data: {
        totalPublicReports: totalPublicQRs,
        totalHarvests,
        totalFarmers,
        totalManufacturers,
        totalLabs,
        totalParticipants: totalFarmers + totalManufacturers + totalLabs,
      },
    });
  } catch (error) {
    console.error("Error fetching public stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
});

export default router;

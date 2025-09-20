// controllers/publicController.js

import { PrismaClient } from "@prisma/client";
import QRCode from "qrcode";

const prisma = new PrismaClient();

/**
 * Get the base URL for QR codes
 * Priority: NGROK_URL > API_BASE_URL > localhost fallback
 */
const getBaseUrl = () => {
  return (
    process.env.NGROK_URL ||
    process.env.API_BASE_URL ||
    "https://cfacb9603025.ngrok-free.app"
  );
};

/**
 * @desc    Get all public QR codes for landing page display
 * @access  Public
 */
export const getPublicQRCodes = async (req, res) => {
  try {
    const { page = 1, limit = 12, search = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const searchFilter = search
      ? {
          OR: [
            { productName: { contains: search, mode: "insensitive" } },
            { harvestIdentifier: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const qrCodes = await prisma.qRTracker.findMany({
      where: {
        isPublic: true,
        status: "PUBLIC",
        ...searchFilter,
      },
      skip,
      take: parseInt(limit),
      orderBy: { updatedAt: "desc" },
    });

    // OPTIMIZATION: Fetch all related harvests in a single query
    const harvestIdentifiers = qrCodes.map((qr) => qr.harvestIdentifier);
    const harvests = await prisma.harvest.findMany({
      where: { identifier: { in: harvestIdentifiers } },
      include: { submittedBy: { include: { user: true } } },
    });
    const harvestMap = new Map(harvests.map((h) => [h.identifier, h]));

    const enrichedQRCodes = await Promise.all(
      qrCodes.map(async (qr) => {
        const harvest = harvestMap.get(qr.harvestIdentifier);

        // Check if QR image needs to be regenerated (has localhost URL)
        let qrImageUrl = qr.stageCompletions?.qrImageUrl || null;

        if (
          !qrImageUrl ||
          qrImageUrl.includes("localhost") ||
          qrImageUrl.includes("127.0.0.1")
        ) {
          try {
            // Regenerate QR image with correct ngrok URL
            const correctUrl = `${getBaseUrl()}/api/qr/report/${qr.qrCode}`;
            const QRCode = await import("qrcode");
            qrImageUrl = await QRCode.default.toDataURL(correctUrl, {
              width: 256,
              margin: 2,
              color: {
                dark: "#000000",
                light: "#FFFFFF",
              },
            });

            // Update the database with the correct image
            await prisma.qRTracker.update({
              where: { id: qr.id },
              data: {
                publicUrl: correctUrl,
                stageCompletions: {
                  ...qr.stageCompletions,
                  qrImageUrl: qrImageUrl,
                },
              },
            });
          } catch (error) {
            console.error(
              `Error regenerating QR image for ${qr.qrCode}:`,
              error
            );
          }
        }

        return {
          // Existing Fields
          qrCode: qr.qrCode,
          productName: qr.productName || `${harvest?.herbSpecies} Product`,
          batchId: qr.batchId,
          herbSpecies: harvest?.herbSpecies || "N/A",
          farmerName: harvest?.submittedBy?.user?.fullName || "N/A",
          updatedAt: qr.updatedAt,

          // ADDED: Missing Fields
          fpoName: harvest?.submittedBy?.fpoName || "Unknown FPO",
          harvestLocation: harvest?.location || "Unknown Location",
          harvestWeight: harvest?.harvestWeightKg || 0,
          harvestIdentifier: qr.harvestIdentifier,
          createdAt: qr.createdAt,
          qrImageUrl: qrImageUrl, // Use the corrected image URL
          status: qr.status,

          // No need to send this, frontend store can build it
          // reportUrl: `/api/qr/report/${qr.qrCode}`,
        };
      })
    );

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
        },
      },
    });
  } catch (error) {
    console.error("Error fetching public QR codes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch public QR codes",
    });
  }
};

/**
 * @desc    Generate scannable QR code image
 * @access  Public
 */
export const getScannerQRCode = async (req, res) => {
  try {
    const { qrCode } = req.params;

    const qrTracker = await prisma.qRTracker.findUnique({ where: { qrCode } });

    if (!qrTracker || !qrTracker.isPublic) {
      return res
        .status(404)
        .json({ message: "QR code not found or is not public." });
    }

    // Use the correct ngrok URL for the report URL
    const reportUrl = `${getBaseUrl()}/api/qr/report/${qrCode}`;

    const qrImageBuffer = await QRCode.toBuffer(reportUrl, {
      width: 512,
      margin: 4,
      errorCorrectionLevel: "H",
    });

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 1 day
    res.send(qrImageBuffer);
  } catch (error) {
    console.error("Error generating scanner QR code:", error);
    res.status(500).json({ message: "Failed to generate scanner QR code" });
  }
};

/**
 * @desc    Get public statistics for landing page
 * @access  Public
 */
export const getPublicStats = async (req, res) => {
  try {
    const [
      totalPublicQRs,
      totalHarvests,
      totalFarmers,
      totalManufacturers,
      totalLabs,
    ] = await prisma.$transaction([
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
        totalParticipants: totalFarmers + totalManufacturers + totalLabs,
      },
    });
  } catch (error) {
    console.error("Error fetching public stats:", error);
    res.status(500).json({ message: "Failed to fetch statistics" });
  }
};

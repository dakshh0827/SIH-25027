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
    "https://ayurtrace.onrender.com"
  );
};

/**
 * @desc     Get all QR codes for landing page display (accessible at all stages)
 * @access   Public
 */
export const getPublicQRCodes = async (req, res) => {
  try {
    const { page = 1, limit = 12, search = "", status = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const searchFilter = search
      ? {
          OR: [
            { productName: { contains: search, mode: "insensitive" } },
            { harvestIdentifier: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    // Status filter - if provided, filter by specific status
    const statusFilter = status ? { status: status.toUpperCase() } : {};

    // CHANGE: Remove isPublic restriction - now accessible at all stages
    const qrCodes = await prisma.qRTracker.findMany({
      where: {
        ...searchFilter,
        ...statusFilter,
        // Removed: isPublic: true restriction
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

        let qrImageUrl = qr.stageCompletions?.qrImageUrl || null;

        if (
          !qrImageUrl ||
          qrImageUrl.includes("localhost") ||
          qrImageUrl.includes("127.0.0.1")
        ) {
          try {
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
          qrCode: qr.qrCode,
          productName: qr.productName || `${harvest?.herbSpecies} Product`,
          batchId: qr.batchId,
          herbSpecies: harvest?.herbSpecies || "N/A",
          farmerName: harvest?.submittedBy?.user?.fullName || "N/A",
          updatedAt: qr.updatedAt,
          fpoName: harvest?.submittedBy?.fpoName || "Unknown FPO",
          harvestLocation: harvest?.location || "Unknown Location",
          harvestWeight: harvest?.harvestWeightKg || 0,
          harvestIdentifier: qr.harvestIdentifier,
          createdAt: qr.createdAt,
          qrImageUrl: qrImageUrl,
          status: qr.status,
          harvestSeason: harvest?.harvestSeason || "Unknown Season",
          // Keep isPublic flag for frontend to handle differently if needed
          isPublic: qr.isPublic,
        };
      })
    );

    // CHANGE: Remove isPublic restriction from count query
    const totalCount = await prisma.qRTracker.count({
      where: {
        ...searchFilter,
        ...statusFilter,
        // Removed: isPublic: true restriction
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
    console.error("Error fetching QR codes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch QR codes",
    });
  }
};

/**
 * @desc     Generate scannable QR code image (accessible at all stages)
 * @access   Public
 */
export const getScannerQRCode = async (req, res) => {
  try {
    const { qrCode } = req.params;

    const qrTracker = await prisma.qRTracker.findUnique({ where: { qrCode } });

    if (!qrTracker) {
      return res.status(404).json({ message: "QR code not found." });
    }

    // CHANGE: Remove isPublic check - now accessible at all stages
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
 * @desc     Get statistics for landing page (includes all QR codes at all stages)
 * @access   Public
 */
export const getPublicStats = async (req, res) => {
  try {
    const [
      totalQRs,
      totalPublicQRs,
      totalHarvests,
      totalFarmers,
      totalManufacturers,
      totalLabs,
      qrsByStatus,
    ] = await prisma.$transaction([
      // CHANGE: Show all QR codes instead of just public ones as main stat
      prisma.qRTracker.count(), // All QR codes at all stages
      prisma.qRTracker.count({ where: { isPublic: true } }), // Keep track of officially public ones
      prisma.harvest.count(),
      prisma.farmerProfile.count(),
      prisma.manufacturerProfile.count(),
      prisma.laboratoryProfile.count(),
      // Get breakdown by status for all QR codes
      prisma.qRTracker.groupBy({
        by: ["status"],
        _count: {
          status: true,
        },
      }),
    ]);

    // Convert status breakdown to a more readable format
    const statusBreakdown = qrsByStatus.reduce((acc, item) => {
      acc[item.status.toLowerCase()] = item._count.status;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalReports: totalQRs, // All reports at all stages
        totalPublicReports: totalPublicQRs, // Only officially public reports
        totalHarvests,
        totalParticipants: totalFarmers + totalManufacturers + totalLabs,
        statusBreakdown, // Breakdown by status for all QR codes
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Failed to fetch statistics" });
  }
};

/**
 * @desc     Get QR preview data (accessible at all stages)
 * @access   Public
 */
export const getQRPreview = async (req, res) => {
  try {
    const { qrCode } = req.params;

    const qrTracker = await prisma.qRTracker.findUnique({
      where: { qrCode },
    });

    if (!qrTracker) {
      return res.status(404).json({
        success: false,
        message: "QR code not found",
      });
    }

    // CHANGE: Remove isPublic check - now accessible at all stages

    // Get harvest data
    const harvest = await prisma.harvest.findUnique({
      where: { identifier: qrTracker.harvestIdentifier },
      include: { submittedBy: { include: { user: true } } },
    });

    res.json({
      success: true,
      data: {
        qrCode: qrTracker.qrCode,
        productName: qrTracker.productName || `${harvest?.herbSpecies} Product`,
        batchId: qrTracker.batchId,
        herbSpecies: harvest?.herbSpecies || "N/A",
        farmerName: harvest?.submittedBy?.user?.fullName || "N/A",
        status: qrTracker.status,
        isPublic: qrTracker.isPublic,
        harvestIdentifier: qrTracker.harvestIdentifier,
        harvestSeason: harvest?.harvestSeason || "Unknown Season",
        createdAt: qrTracker.createdAt,
        updatedAt: qrTracker.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching QR preview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch QR preview",
    });
  }
};

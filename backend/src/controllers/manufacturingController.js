// controllers/manufacturingController.js - Fixed version
import { PrismaClient } from "@prisma/client";
import QRTrackingService from "../services/qrService.js";

const prisma = new PrismaClient();

export const createManufacturingReport = async (req, res) => {
  try {
    const {
      batchId,
      herbUsed,
      quantityUsedKg,
      processingSteps,
      status,
      effectiveDate,
      expiryDate,
      notes,
      regulatoryTags,
      harvestIdentifier,
    } = req.body;

    // 1. --- Comprehensive Validation ---
    if (!harvestIdentifier || harvestIdentifier.trim() === "") {
      return res.status(400).json({
        message: "Harvest identifier is required to link with QR tracking.",
        error: "MISSING_HARVEST_IDENTIFIER",
      });
    }

    if (!batchId || batchId.trim() === "") {
      return res.status(400).json({
        message: "Batch ID is required for the manufacturing report.",
        error: "MISSING_BATCH_ID",
      });
    }

    if (!herbUsed || herbUsed.trim() === "") {
      return res.status(400).json({
        message: "Herb used is required for the manufacturing report.",
        error: "MISSING_HERB_USED",
      });
    }

    if (!quantityUsedKg || isNaN(parseFloat(quantityUsedKg))) {
      return res.status(400).json({
        message: "A valid quantity used (in kg) is required.",
        error: "INVALID_QUANTITY",
      });
    }

    if (!processingSteps || processingSteps.trim() === "") {
      return res.status(400).json({
        message: "Processing steps are required for the manufacturing report.",
        error: "MISSING_PROCESSING_STEPS",
      });
    }

    // 2. --- Verify Associated Records ---
    const harvest = await prisma.harvest.findUnique({
      where: { identifier: harvestIdentifier.trim() },
    });

    if (!harvest) {
      return res.status(400).json({
        message:
          "Invalid harvest identifier. Please ensure the harvest exists.",
        error: "HARVEST_NOT_FOUND",
      });
    }

    const manufacturerProfile = await prisma.manufacturerProfile.findUnique({
      where: { userId: req.user.id },
      include: { user: true },
    });

    if (!manufacturerProfile) {
      return res.status(404).json({
        message: "Manufacturer profile not found for this user.",
        error: "MANUFACTURER_PROFILE_NOT_FOUND",
      });
    }

    const existingBatch = await prisma.manufacturingReport.findUnique({
      where: { batchId: batchId.trim() },
    });

    if (existingBatch) {
      return res.status(400).json({
        message: "Duplicate batch ID. Please use a unique batch ID.",
        error: "DUPLICATE_BATCH_ID",
      });
    }

    // 3. --- Prepare and Create Report ---
    const timestamp = Date.now().toString().slice(-6);
    const manufacturerCode = manufacturerProfile.id.slice(-4).toUpperCase();
    const identifier = `MFG-${timestamp}-${manufacturerCode}`;

    let parsedTags = [];
    if (regulatoryTags) {
      parsedTags = Array.isArray(regulatoryTags)
        ? regulatoryTags
        : [regulatoryTags];
    }

    const manufacturingReport = await prisma.manufacturingReport.create({
      data: {
        identifier,
        batchId: batchId.trim(),
        herbUsed: herbUsed.trim(),
        quantityUsedKg: parseFloat(quantityUsedKg),
        processingSteps: processingSteps.trim(),
        status: status || "in-progress",
        harvestIdentifier: harvestIdentifier.trim(),
        manufacturerProfileId: manufacturerProfile.id,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        notes: notes || "",
        regulatoryTags: parsedTags,
      },
    });

    // 4. --- Update QR Tracking Service ---
    let qrUpdateResult = null;
    try {
      qrUpdateResult = await QRTrackingService.updateWithManufacturing(
        harvestIdentifier.trim(),
        {
          manufacturingReportId: manufacturingReport.id,
          batchId: manufacturingReport.batchId,
          // Correctly set the product name to just the herb
          productName: manufacturingReport.herbUsed,
        }
      );
    } catch (qrError) {
      console.error(
        "QR update failed but report was created:",
        qrError.message
      );
    }

    // 5. --- Send Final Response ---
    const response = {
      success: true,
      message: "Manufacturing report created successfully",
      data: manufacturingReport,
    };

    if (qrUpdateResult) {
      response.qrUpdate = {
        qrCode: qrUpdateResult.qrCode,
        status: qrUpdateResult.status,
        productName: qrUpdateResult.productName,
        batchId: qrUpdateResult.batchId,
      };
      response.message =
        "Manufacturing report created and QR tracking updated successfully";
    } else {
      response.qrUpdate = {
        error: "Failed to update QR tracker. It can be updated later.",
      };
    }

    res.status(201).json(response);
  } catch (error) {
    console.error("Create manufacturing report error:", error);

    if (error.code === "P2002") {
      const target = error.meta?.target;
      if (target?.includes("batchId")) {
        return res.status(400).json({
          message: "Duplicate batch ID. Please use a unique batch ID.",
          error: "DUPLICATE_BATCH_ID",
        });
      }
      return res.status(400).json({
        message: "A unique constraint was violated. Please check your inputs.",
        error: "DUPLICATE_ENTRY",
      });
    }

    res.status(500).json({
      message: "Server error while creating the manufacturing report.",
      error: error.message,
    });
  }
};

export const getManufacturingHistory = async (req, res) => {
  try {
    console.log("Fetching manufacturing history for user:", req.user?.id);

    const manufacturerProfile = await prisma.manufacturerProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!manufacturerProfile) {
      return res.status(403).json({
        message: "Manufacturer profile not found for this user.",
        error: "MANUFACTURER_PROFILE_NOT_FOUND",
      });
    }

    console.log(
      "Found manufacturer profile:",
      manufacturerProfile.manufacturerName
    );

    // FIXED: Fetch manufacturing reports with correct field name
    const reports = await prisma.manufacturingReport.findMany({
      where: {
        manufacturerProfileId: manufacturerProfile.id, // This is correct
      },
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: {
            manufacturerName: true,
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    console.log(`Found ${reports.length} manufacturing reports`);

    // Get QR tracking info for each report
    const reportsWithQR = await Promise.all(
      reports.map(async (report) => {
        let qrTracker = null;
        try {
          qrTracker = await prisma.qRTracker.findUnique({
            where: { harvestIdentifier: report.harvestIdentifier },
            select: {
              qrCode: true,
              status: true,
              isPublic: true,
              publicUrl: true,
              productName: true,
              batchId: true,
              stageCompletions: true,
            },
          });
        } catch (qrError) {
          console.error(
            `Failed to fetch QR for harvest ${report.harvestIdentifier}:`,
            qrError
          );
        }

        return {
          ...report,
          qrTracking: qrTracker,
          // Add convenience fields
          hasQRTracking: !!qrTracker,
          qrCode: qrTracker?.qrCode || null,
          qrStatus: qrTracker?.status || null,
          isPublic: qrTracker?.isPublic || false,
          publicUrl: qrTracker?.publicUrl || null,
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Manufacturing history retrieved successfully",
      data: reportsWithQR,
      count: reportsWithQR.length,
    });
  } catch (error) {
    console.error("Manufacturing history fetch error:", error);
    res.status(500).json({
      message: "Server error while fetching manufacturing history.",
      error: error.message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }
};

// Get manufacturing QR history
export const getManufacturerQRHistory = async (req, res) => {
  try {
    const manufacturerProfile = await prisma.manufacturerProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!manufacturerProfile) {
      return res.status(403).json({
        message: "Manufacturer profile not found for this user.",
        error: "MANUFACTURER_PROFILE_NOT_FOUND",
      });
    }

    // Get all manufacturing reports by this manufacturer
    const reports = await prisma.manufacturingReport.findMany({
      where: { manufacturerProfileId: manufacturerProfile.id },
      select: {
        harvestIdentifier: true,
        identifier: true,
        batchId: true,
        herbUsed: true,
        createdAt: true,
      },
    });

    const harvestIdentifiers = reports.map((r) => r.harvestIdentifier);

    // Get QR trackers for these harvests
    const qrTrackers = await prisma.qRTracker.findMany({
      where: {
        harvestIdentifier: { in: harvestIdentifiers },
        status: { in: ["MANUFACTURING", "TESTING", "COMPLETED", "PUBLIC"] },
      },
      orderBy: { updatedAt: "desc" },
    });

    const formattedQRHistory = qrTrackers.map((tracker) => {
      const reportInfo = reports.find(
        (r) => r.harvestIdentifier === tracker.harvestIdentifier
      );

      return {
        qrCode: tracker.qrCode,
        productName: tracker.productName,
        batchId: tracker.batchId,
        status: tracker.status,
        isPublic: tracker.isPublic,
        publicUrl: tracker.publicUrl,
        createdAt: tracker.createdAt,
        updatedAt: tracker.updatedAt,
        harvestIdentifier: tracker.harvestIdentifier,
        reportInfo,
      };
    });

    res.status(200).json({
      success: true,
      message: "Manufacturing QR history retrieved successfully",
      data: formattedQRHistory,
      count: formattedQRHistory.length,
    });
  } catch (error) {
    console.error("Get manufacturer QR history error:", error);
    res.status(500).json({
      message: "Server error while fetching QR history.",
      error: error.message,
    });
  }
};

// controllers/labController.js - Updated with QR integration
import { PrismaClient } from "@prisma/client";
import cloudinary from "../config/cloudinaryConfig.js";
import QRTrackingService from "../services/qrService.js";

const prisma = new PrismaClient();

export const createLabReport = async (req, res) => {
  try {
    const {
      harvestIdentifier,
      testType,
      testResult,
      status,
      effectiveDate,
      issuedDate,
      notes,
      regulatoryTags,
    } = req.body;

    // 1. --- Comprehensive Validation ---
    if (!harvestIdentifier || harvestIdentifier.trim() === "") {
      return res.status(400).json({
        message: "Harvest identifier is required to link with QR tracking.",
        error: "MISSING_HARVEST_IDENTIFIER",
      });
    }

    if (!testType || testType.trim() === "") {
      return res.status(400).json({
        message: "Test type is required for the lab report.",
        error: "MISSING_TEST_TYPE",
      });
    }

    if (!testResult || testResult.trim() === "") {
      return res.status(400).json({
        message: "Test result is required for the lab report.",
        error: "MISSING_TEST_RESULT",
      });
    }

    // Correctly extract the file from req.files
    let labReportFile = null;
    if (req.files) {
      if (req.files.labReportFile) {
        labReportFile = req.files.labReportFile[0];
      } else if (req.files.file) {
        labReportFile = req.files.file[0];
      } else if (req.files.report) {
        labReportFile = req.files.report[0];
      }
    }

    if (!labReportFile) {
      return res.status(400).json({
        message: "Lab report file is required.",
        error: "MISSING_FILE",
      });
    }

    // 2. --- Verify Associated Records ---
    const harvest = await prisma.harvest.findUnique({
      where: { identifier: harvestIdentifier.trim() },
    });

    if (!harvest) {
      return res.status(400).json({
        message:
          "Invalid harvest identifier. Please check the harvest identifier.",
        error: "HARVEST_NOT_FOUND",
      });
    }

    const laboratoryProfile = await prisma.laboratoryProfile.findUnique({
      where: { userId: req.user.id },
      include: { user: true },
    });

    if (!laboratoryProfile) {
      return res.status(403).json({
        message: "Laboratory profile not found for this user.",
        error: "LAB_PROFILE_NOT_FOUND",
      });
    }

    // 3. --- Generate Unique Identifier ---
    const timestamp = Date.now().toString().slice(-6);
    const labCode = laboratoryProfile.id.slice(-4).toUpperCase();
    const identifier = `LAB-${timestamp}-${labCode}`;

    // 4. --- Upload Lab Report to Cloudinary ---
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "lab_reports",
          resource_type: "auto",
          public_id: `lab_report_${identifier}`,
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(new Error("Failed to upload lab report file"));
          } else {
            resolve(result);
          }
        }
      );
      stream.end(labReportFile.buffer);
    });

    // 5. --- Prepare Regulatory Tags ---
    let parsedTags = [];
    if (regulatoryTags) {
      parsedTags = Array.isArray(regulatoryTags)
        ? regulatoryTags
        : [regulatoryTags];
    }

    // 6. --- Create Lab Report ---
    const newLabReport = await prisma.labReport.create({
      data: {
        identifier,
        testType: testType.trim(),
        testResult: testResult.trim(),
        status: status || "final",
        effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
        issuedDate: issuedDate ? new Date(issuedDate) : new Date(),
        labReportFileUrl: result.secure_url,
        laboratoryProfileId: laboratoryProfile.id,
        harvestIdentifier: harvestIdentifier.trim(),
        notes: notes || "",
        regulatoryTags: parsedTags,
      },
    });

    // 7. --- Update QR Tracking Service ---
    let qrUpdateResult = null;
    try {
      qrUpdateResult = await QRTrackingService.updateWithLabTesting(
        harvestIdentifier.trim(),
        {
          labReportId: newLabReport.id,
          labIdentifier: newLabReport.identifier,
          testType: newLabReport.testType,
          testResult: newLabReport.testResult,
          labName: laboratoryProfile.labName,
          labEmail: laboratoryProfile.user.email,
          reportFileUrl: newLabReport.labReportFileUrl,
        }
      );
    } catch (qrError) {
      console.error(
        "QR update failed but lab report was created:",
        qrError.message
      );
    }

    // 8. --- Send Final Response ---
    const response = {
      success: true,
      message: "Lab report created successfully",
      data: newLabReport,
    };

    if (qrUpdateResult) {
      response.qrUpdate = {
        qrCode: qrUpdateResult.qrCode,
        status: qrUpdateResult.status,
        isPublic: qrUpdateResult.isPublic,
        updated: true,
      };
      response.message =
        "Lab report created and QR tracking updated successfully";

      // If the QR tracker is now public (all stages completed), include that info
      if (qrUpdateResult.isPublic) {
        response.qrUpdate.message =
          "Product is now available for public tracking!";
        response.qrUpdate.publicUrl = qrUpdateResult.publicUrl;
      }
    } else {
      response.qrUpdate = {
        error: "Failed to update QR tracker. It can be updated later.",
        updated: false,
      };
    }

    res.status(201).json(response);
  } catch (error) {
    console.error("Create lab report error:", error);

    // Handle specific Prisma errors
    if (error.code === "P2002") {
      const target = error.meta?.target;
      if (target?.includes("identifier")) {
        return res.status(400).json({
          message: "Duplicate lab report identifier. Please try again.",
          error: "DUPLICATE_IDENTIFIER",
        });
      }
      return res.status(400).json({
        message: "A unique constraint was violated. Please check your inputs.",
        error: "DUPLICATE_ENTRY",
      });
    }

    // Handle file upload errors
    if (error.message.includes("upload")) {
      return res.status(500).json({
        message: "Failed to upload lab report file. Please try again.",
        error: "UPLOAD_FAILED",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating lab report.",
      error: error.message,
    });
  }
};

// Additional controller function to get lab QR history
export const getLabQRHistory = async (req, res) => {
  try {
    const laboratoryProfile = await prisma.laboratoryProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!laboratoryProfile) {
      return res.status(404).json({
        message: "Laboratory profile not found.",
      });
    }

    // Get all lab reports for this laboratory
    const labReports = await prisma.labReport.findMany({
      where: { laboratoryProfileId: laboratoryProfile.id },
      select: {
        harvestIdentifier: true,
        identifier: true,
        testType: true,
        testResult: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (labReports.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No lab reports found for QR history.",
      });
    }

    // Get QR trackers for these harvest identifiers
    const harvestIdentifiers = labReports.map(
      (report) => report.harvestIdentifier
    );
    const qrTrackers = await prisma.qRTracker.findMany({
      where: {
        harvestIdentifier: {
          in: harvestIdentifiers,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Combine lab report and QR data
    const qrHistory = qrTrackers.map((qr) => {
      const labReport = labReports.find(
        (report) => report.harvestIdentifier === qr.harvestIdentifier
      );
      return {
        qrCode: qr.qrCode,
        status: qr.status,
        isPublic: qr.isPublic,
        productName: qr.productName || "Unknown Product",
        batchId: qr.batchId,
        publicUrl: qr.publicUrl,
        harvestIdentifier: qr.harvestIdentifier,
        labReport: labReport
          ? {
              identifier: labReport.identifier,
              testType: labReport.testType,
              testResult: labReport.testResult,
              createdAt: labReport.createdAt,
            }
          : null,
        createdAt: qr.createdAt,
        updatedAt: qr.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      data: qrHistory,
      message: `Found ${qrHistory.length} QR code(s) linked to your lab reports.`,
    });
  } catch (error) {
    console.error("Error fetching lab QR history:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching QR history.",
      error: error.message,
    });
  }
};
export const getLabHistory = async (req, res) => {
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

    const reports = await prisma.labReport.findMany({
      where: { laboratoryProfileId: laboratoryProfile.id },
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: {
            id: true,
            labName: true,
            nablAccreditationNumber: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Get QR tracking info for each report
    const reportsWithQR = await Promise.all(
      reports.map(async (report) => {
        try {
          const qrTracker = await prisma.qRTracker.findUnique({
            where: { harvestIdentifier: report.harvestIdentifier },
            select: {
              qrCode: true,
              status: true,
              isPublic: true,
              publicUrl: true,
            },
          });

          return {
            id: report.id,
            identifier: report.identifier,
            testType: report.testType,
            testResult: report.testResult,
            status: report.status,
            effectiveDate: report.effectiveDate?.toISOString(),
            issuedDate: report.issuedDate?.toISOString(),
            createdAt: report.createdAt.toISOString(),
            updatedAt: report.updatedAt?.toISOString(),
            notes: report.notes,
            regulatoryTags: report.regulatoryTags || [],
            labReportFileUrl: report.labReportFileUrl,
            harvestIdentifier: report.harvestIdentifier,
            laboratoryProfile: report.createdBy,
            createdBy: report.createdBy?.user,
            qrTracking: qrTracker
              ? {
                  qrCode: qrTracker.qrCode,
                  status: qrTracker.status,
                  isPublic: qrTracker.isPublic,
                  publicUrl: qrTracker.publicUrl,
                }
              : null,
          };
        } catch (error) {
          console.error("Error fetching QR for report:", report.identifier);
          return {
            ...report,
            qrTracking: null,
          };
        }
      })
    );

    res.status(200).json({
      success: true,
      message: "Lab history retrieved successfully",
      count: reportsWithQR.length,
      data: reportsWithQR,
    });
  } catch (error) {
    console.error("Error fetching lab history:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching lab history.",
      error: error.message,
    });
  }
};

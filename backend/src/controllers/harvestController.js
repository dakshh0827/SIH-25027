// controllers/harvestController.js - Fixed Multer error handling
import { PrismaClient } from "@prisma/client";
import cloudinary from "../config/cloudinaryConfig.js";
import QRTrackingService from "../services/qrService.js";

const prisma = new PrismaClient();

// controllers/harvestController.js

export const createHarvest = async (req, res) => {
  try {
    const {
      identifier,
      herbSpecies,
      harvestWeightKg,
      harvestSeason,
      location,
      notes,
    } = req.body;

    // Extract the file from req.files
    let harvestProofFile = null;
    if (req.files) {
      if (req.files.harvestProofImage) {
        harvestProofFile = req.files.harvestProofImage[0];
      } else if (req.files.harvestProof) {
        harvestProofFile = req.files.harvestProof[0];
      } else if (req.files.image) {
        harvestProofFile = req.files.image[0];
      } else if (req.files.file) {
        harvestProofFile = req.files.file[0];
      }
    }

    if (!harvestProofFile) {
      return res.status(400).json({
        message: "Harvest proof image is required.",
        error: "MISSING_FILE",
        debug:
          "Expected file in one of these fields: harvestProofImage, harvestProof, image, file",
      });
    }

    if (!identifier) {
      return res.status(400).json({
        message: "Harvest identifier is required.",
      });
    }

    const existingHarvest = await prisma.harvest.findUnique({
      where: { identifier },
    });

    if (existingHarvest) {
      return res.status(400).json({
        message: "A harvest with this identifier already exists.",
      });
    }

    const farmerProfile = await prisma.farmerProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!farmerProfile) {
      return res.status(403).json({
        message: "Farmer profile not found.",
      });
    }

    // Upload harvest proof to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "harvest_proofs",
          resource_type: "auto",
          public_id: `harvest_${identifier}_${Date.now()}`,
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return reject(new Error("Failed to upload harvest proof image"));
          }
          resolve(result);
        }
      );
      stream.end(harvestProofFile.buffer);
    });

    // Create harvest record
    const newHarvest = await prisma.harvest.create({
      data: {
        identifier,
        herbSpecies,
        harvestWeightKg: parseFloat(harvestWeightKg),
        harvestSeason,
        location,
        harvestProofUrl: uploadResult.secure_url,
        farmerProfileId: farmerProfile.id,
        notes: notes || "",
        status: "pending",
      },
    });

    console.log(
      `Created harvest with ID: ${newHarvest.id} and identifier: ${newHarvest.identifier}`
    );

    // --- FIX: Pass the identifier (string), not the database ID ---
    let qrData = null;
    let qrError = null;

    try {
      console.log(
        `Initializing QR for harvest identifier: ${newHarvest.identifier}`
      );
      qrData = await QRTrackingService.initializeFromHarvest(
        newHarvest.identifier
      );
      console.log(`QR initialization successful: ${qrData.qrCode}`);
    } catch (error) {
      console.error("QR initialization failed:", error);
      qrError = error.message;
    }

    // Prepare response
    const response = {
      message: "Harvest record created successfully",
      data: newHarvest,
    };

    if (qrData) {
      response.qr = {
        qrCode: qrData.qrCode,
        qrImageUrl: qrData.qrImageUrl,
        publicUrl: qrData.publicUrl,
        status: qrData.status,
      };
      response.message = "Harvest record created successfully with QR tracking";
    } else if (qrError) {
      response.qrError = `QR generation failed: ${qrError}`;
      response.message = "Harvest record created but QR generation failed";
    }

    res.status(201).json(response);
  } catch (error) {
    console.error("Create harvest error:", error);

    if (error.code === "P2002") {
      return res.status(400).json({
        message:
          "Duplicate identifier. Please use a unique harvest identifier.",
      });
    }

    res.status(500).json({
      message: "Server error while creating harvest.",
      error: error.message,
    });
  }
};

// Middleware to handle Multer errors specifically
export const handleMulterError = (error, req, res, next) => {
  console.log("=== MULTER ERROR HANDLER ===");
  console.error("Multer error caught:", error);

  if (error.name === "MulterError") {
    console.error("Multer Error Details:");
    console.error("- Code:", error.code);
    console.error("- Field:", error.field);
    console.error("- Message:", error.message);

    let message = "File upload error";
    let statusCode = 400;

    switch (error.code) {
      case "UNEXPECTED_FIELD":
        message = `Unexpected file field '${error.field}'. Please check the field name in your form.`;
        break;
      case "MISSING_FIELD":
        message = `Missing required file field '${error.field}'`;
        break;
      case "TOO_MANY_FILES":
        message = "Too many files uploaded. Please upload only one file.";
        break;
      case "FILE_TOO_LARGE":
        message = "File size exceeds the allowed limit.";
        break;
      case "TOO_MANY_PARTS":
        message = "Too many form fields.";
        break;
      case "TOO_MANY_FIELDS":
        message = "Too many form fields.";
        break;
      default:
        message = `File upload error: ${error.message}`;
    }

    return res.status(statusCode).json({
      success: false,
      message: message,
      error: "MULTER_ERROR",
      debug: {
        code: error.code,
        field: error.field,
        originalMessage: error.message,
      },
    });
  }

  // If it's not a Multer error, pass it to the next error handler
  next(error);
};

export const getHarvestHistory = async (req, res) => {
  console.log("=== getHarvestHistory DEBUG START ===");

  try {
    // Debug 1: Check request user
    console.log("1. Request User Info:");
    console.log("   - User ID:", req.user?.id);
    console.log("   - User Role:", req.user?.role);
    console.log("   - User Email:", req.user?.email);

    if (!req.user?.id) {
      console.log("ERROR: No user ID found in request");
      return res.status(401).json({
        message: "User not authenticated",
        debug: "No user ID in request",
      });
    }

    // Debug 2: Find farmer profile
    console.log("2. Searching for farmer profile...");
    console.log("   - Looking for userId:", req.user.id);

    const farmerProfile = await prisma.farmerProfile.findUnique({
      where: { userId: req.user.id },
    });

    console.log("3. Farmer Profile Result:");
    console.log("   - Found:", !!farmerProfile);
    console.log("   - Profile ID:", farmerProfile?.id);
    console.log("   - FPO Name:", farmerProfile?.fpoName);

    if (!farmerProfile) {
      console.log("ERROR: No farmer profile found");
      console.log("   - This means the user exists but has no farmer profile");
      console.log("   - Check if user completed farmer registration");

      // Debug: Check if user has other profiles
      const otherProfiles = await Promise.all([
        prisma.manufacturerProfile.findUnique({
          where: { userId: req.user.id },
        }),
        prisma.laboratoryProfile.findUnique({ where: { userId: req.user.id } }),
        prisma.adminProfile.findUnique({ where: { userId: req.user.id } }),
      ]);

      console.log("   - Has manufacturer profile:", !!otherProfiles[0]);
      console.log("   - Has laboratory profile:", !!otherProfiles[1]);
      console.log("   - Has admin profile:", !!otherProfiles[2]);

      return res.status(403).json({
        message: "Farmer profile not found for this user.",
        debug: {
          userId: req.user.id,
          userRole: req.user.role,
          hasOtherProfiles: {
            manufacturer: !!otherProfiles[0],
            laboratory: !!otherProfiles[1],
            admin: !!otherProfiles[2],
          },
        },
      });
    }

    // Debug 3: Find harvests
    console.log("4. Searching for harvests...");
    console.log("   - Farmer Profile ID:", farmerProfile.id);

    const harvests = await prisma.harvest.findMany({
      where: { farmerProfileId: farmerProfile.id },
      orderBy: { createdAt: "desc" },
    });

    console.log("5. Harvests Found:");
    console.log("   - Count:", harvests.length);

    if (harvests.length === 0) {
      console.log("   - No harvests found for this farmer");
      console.log(
        "   - This means farmer profile exists but no harvest records"
      );

      return res.status(200).json({
        message: "No harvest records found",
        data: [],
        count: 0,
        debug: {
          farmerProfileId: farmerProfile.id,
          farmerFpoName: farmerProfile.fpoName,
        },
      });
    }

    // Log each harvest
    harvests.forEach((harvest, index) => {
      console.log(`   - Harvest ${index + 1}:`);
      console.log(`     * ID: ${harvest.id}`);
      console.log(`     * Identifier: ${harvest.identifier}`);
      console.log(`     * Herb Species: ${harvest.herbSpecies}`);
      console.log(`     * Created: ${harvest.createdAt}`);
      console.log(`     * Status: ${harvest.status}`);
    });

    // Debug 4: Get QR tracking info
    console.log("6. Fetching QR tracking info...");

    const harvestsWithQR = await Promise.all(
      harvests.map(async (harvest, index) => {
        try {
          console.log(
            `   - Processing harvest ${index + 1} (${harvest.identifier})...`
          );

          const qrTracker = await prisma.qRTracker.findUnique({
            where: { harvestIdentifier: harvest.identifier },
          });

          console.log(`     * QR Tracker found: ${!!qrTracker}`);
          if (qrTracker) {
            console.log(`     * QR Code: ${qrTracker.qrCode}`);
            console.log(`     * Status: ${qrTracker.status}`);
            console.log(`     * Is Public: ${qrTracker.isPublic}`);
            console.log(
              `     * Product Name: ${qrTracker.productName || "N/A"}`
            );
            console.log(`     * Batch ID: ${qrTracker.batchId || "N/A"}`);
          }

          return {
            ...harvest,
            qrStatus: qrTracker
              ? {
                  code: qrTracker.qrCode,
                  status: qrTracker.status,
                  isPublic: qrTracker.isPublic,
                  publicUrl: qrTracker.publicUrl,
                  productName: qrTracker.productName,
                  batchId: qrTracker.batchId,
                  trackingInitiated: qrTracker.createdAt,
                  lastUpdated: qrTracker.updatedAt,
                  stageCompletions: qrTracker.stageCompletions,
                }
              : {
                  code: null,
                  status: "NOT_GENERATED",
                  isPublic: false,
                  publicUrl: null,
                  productName: null,
                  batchId: null,
                  trackingInitiated: null,
                  lastUpdated: null,
                  stageCompletions: {},
                },
          };
        } catch (error) {
          console.error(
            `ERROR fetching QR for harvest ${harvest.identifier}:`,
            error
          );
          return {
            ...harvest,
            qrStatus: {
              code: null,
              status: "ERROR",
              isPublic: false,
              publicUrl: null,
              productName: null,
              batchId: null,
              trackingInitiated: null,
              lastUpdated: null,
              stageCompletions: {},
            },
          };
        }
      })
    );

    console.log("7. Final Results:");
    console.log("   - Total harvests with QR data:", harvestsWithQR.length);
    console.log(
      "   - Harvests with QR codes:",
      harvestsWithQR.filter((h) => h.qrStatus && h.qrStatus.code).length
    );
    console.log(
      "   - Harvests without QR codes:",
      harvestsWithQR.filter((h) => !h.qrStatus || !h.qrStatus.code).length
    );

    console.log("8. Sending response...");

    const response = {
      message: "Harvest history retrieved successfully",
      data: harvestsWithQR,
      count: harvestsWithQR.length,
    };

    console.log("9. Response structure:");
    console.log("   - Message:", response.message);
    console.log("   - Data count:", response.data.length);
    console.log("   - Count field:", response.count);

    console.log("=== getHarvestHistory DEBUG END ===");

    res.status(200).json(response);
  } catch (error) {
    console.log("=== FATAL ERROR in getHarvestHistory ===");
    console.error("Error details:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // Additional error context
    if (error.code) {
      console.error("Error code:", error.code);
    }
    if (error.meta) {
      console.error("Error meta:", error.meta);
    }

    res.status(500).json({
      message: "Server error while fetching harvest history.",
      error: error.message,
      debug: {
        errorName: error.name,
        errorCode: error.code,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

// Get QR history specifically for farmers
export const getFarmerQRHistory = async (req, res) => {
  try {
    const farmerProfile = await prisma.farmerProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!farmerProfile) {
      return res.status(403).json({
        message: "Farmer profile not found for this user.",
      });
    }

    // Get all harvests by this farmer
    const harvests = await prisma.harvest.findMany({
      where: { farmerProfileId: farmerProfile.id },
      select: {
        identifier: true,
        herbSpecies: true,
        harvestWeightKg: true,
        harvestSeason: true,
        createdAt: true,
        location: true,
      },
    });

    const harvestIdentifiers = harvests.map((h) => h.identifier);

    // Get QR trackers for these harvests
    const qrTrackers = await prisma.qRTracker.findMany({
      where: {
        harvestIdentifier: { in: harvestIdentifiers },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedQRHistory = qrTrackers.map((tracker) => {
      const harvestInfo = harvests.find(
        (h) => h.identifier === tracker.harvestIdentifier
      );

      return {
        qrCode: tracker.qrCode,
        productName:
          tracker.productName || `${harvestInfo?.herbSpecies} Harvest`,
        batchId: tracker.batchId,
        status: tracker.status,
        isPublic: tracker.isPublic,
        publicUrl: tracker.publicUrl,
        createdAt: tracker.createdAt,
        updatedAt: tracker.updatedAt,
        harvestIdentifier: tracker.harvestIdentifier,
        harvestInfo,
      };
    });

    res.status(200).json({
      message: "QR history retrieved successfully",
      data: formattedQRHistory,
      count: formattedQRHistory.length,
    });
  } catch (error) {
    console.error("Get farmer QR history error:", error);
    res.status(500).json({
      message: "Server error while fetching QR history.",
      error: error.message,
    });
  }
};

// Regenerate QR code for a harvest (in case initial generation failed)
export const regenerateHarvestQR = async (req, res) => {
  try {
    const { identifier } = req.params; // Use harvest identifier instead of harvestId

    // Verify the harvest belongs to the current farmer
    const harvest = await prisma.harvest.findFirst({
      where: {
        identifier,
        submittedBy: {
          userId: req.user.id,
        },
      },
      include: {
        submittedBy: true,
      },
    });

    if (!harvest) {
      return res.status(404).json({
        message: "Harvest not found or you don't have permission to access it.",
      });
    }

    // Check if QR already exists
    const existingQR = await prisma.qRTracker.findUnique({
      where: { harvestIdentifier: identifier },
    });

    if (existingQR) {
      // Generate fresh QR image
      const qrImageUrl = await QRTrackingService.generateQRImage(
        existingQR.qrCode,
        existingQR.publicUrl
      );

      return res.status(200).json({
        message: "QR code already exists for this harvest.",
        qr: {
          qrCode: existingQR.qrCode,
          status: existingQR.status,
          publicUrl: existingQR.publicUrl,
          qrImageUrl,
        },
      });
    }

    // Generate new QR
    const qrData = await QRTrackingService.initializeFromHarvest(identifier);

    res.status(200).json({
      message: "QR code generated successfully",
      qr: {
        qrCode: qrData.qrCode,
        qrImageUrl: qrData.qrImageUrl,
        publicUrl: qrData.publicUrl,
      },
    });
  } catch (error) {
    console.error("Regenerate QR error:", error);
    res.status(500).json({
      message: "Server error while regenerating QR code.",
      error: error.message,
    });
  }
};

// Get harvest by identifier (useful for manufacturers to link)
export const getHarvestByIdentifier = async (req, res) => {
  try {
    const { identifier } = req.params;

    const harvest = await prisma.harvest.findUnique({
      where: { identifier },
      include: {
        submittedBy: {
          include: { user: true },
        },
      },
    });

    if (!harvest) {
      return res.status(404).json({
        message: "Harvest not found with the provided identifier.",
      });
    }

    // Get QR tracker info
    const qrTracker = await prisma.qRTracker.findUnique({
      where: { harvestIdentifier: identifier },
      select: {
        qrCode: true,
        status: true,
        isPublic: true,
      },
    });

    // Return basic info (don't expose sensitive data to manufacturers)
    const publicHarvestInfo = {
      identifier: harvest.identifier,
      herbSpecies: harvest.herbSpecies,
      harvestWeightKg: harvest.harvestWeightKg,
      harvestSeason: harvest.harvestSeason,
      location: harvest.location,
      status: harvest.status,
      createdAt: harvest.createdAt,
      farmerName: harvest.submittedBy.user.fullName,
      fpoName: harvest.submittedBy.fpoName,
      qrStatus: qrTracker ? qrTracker.status : null,
      hasQRTracking: !!qrTracker,
    };

    res.status(200).json({
      message: "Harvest information retrieved successfully",
      data: publicHarvestInfo,
    });
  } catch (error) {
    console.error("Get harvest by identifier error:", error);
    res.status(500).json({
      message: "Server error while fetching harvest information.",
      error: error.message,
    });
  }
};

// List all harvest identifiers (for manufacturers to reference)
export const getHarvestIdentifiers = async (req, res) => {
  try {
    const harvests = await prisma.harvest.findMany({
      select: {
        identifier: true,
        herbSpecies: true,
        harvestSeason: true,
        location: true,
        createdAt: true,
        submittedBy: {
          select: {
            fpoName: true,
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedHarvests = harvests.map((harvest) => ({
      identifier: harvest.identifier,
      herbSpecies: harvest.herbSpecies,
      harvestSeason: harvest.harvestSeason,
      location: harvest.location,
      createdAt: harvest.createdAt,
      farmerName: harvest.submittedBy.user.fullName,
      fpoName: harvest.submittedBy.fpoName,
    }));

    res.status(200).json({
      message: "Harvest identifiers retrieved successfully",
      data: formattedHarvests,
      count: formattedHarvests.length,
    });
  } catch (error) {
    console.error("Get harvest identifiers error:", error);
    res.status(500).json({
      message: "Server error while fetching harvest identifiers.",
      error: error.message,
    });
  }
};

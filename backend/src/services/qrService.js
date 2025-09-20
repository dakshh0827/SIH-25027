import { PrismaClient } from "@prisma/client";
import QRCode from "qrcode";
import crypto from "crypto";
import { generateReportHTML } from "./pdfTemplate.js";
import puppeteer from "puppeteer";

// Initialize Prisma client
const prisma = new PrismaClient();

class QRTrackingService {
  constructor() {
    // You can add any initialization logic here if needed
  }

  /**
   * Initialize QR tracking from harvest
   * @param {string} harvestIdentifier - The harvest identifier
   * @returns {Object} QR tracking data
   */
  async initializeFromHarvest(harvestIdentifier) {
    try {
      console.log(`=== QR INITIALIZATION START for ${harvestIdentifier} ===`);

      // 1. Find the harvest by identifier
      const harvest = await prisma.harvest.findUnique({
        where: { identifier: harvestIdentifier },
        include: {
          submittedBy: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!harvest) {
        throw new Error(
          `Harvest with identifier ${harvestIdentifier} not found`
        );
      }

      console.log(`1. Harvest found: ${harvest.id}`);

      // 2. Check if QR tracker already exists
      const existingQRTracker = await prisma.qRTracker.findFirst({
        where: { harvestIdentifier: harvest.identifier },
      });

      if (existingQRTracker) {
        console.log(
          `2. QR tracker already exists: ${existingQRTracker.qrCode}`
        );
        return {
          qrCode: existingQRTracker.qrCode,
          qrImageUrl: existingQRTracker.stageCompletions?.qrImageUrl || null,
          publicUrl: existingQRTracker.publicUrl,
          status: existingQRTracker.status,
          productName: existingQRTracker.productName,
          batchId: existingQRTracker.batchId,
        };
      }

      // 3. Generate unique QR code
      const qrCode = this.generateQRCode();
      console.log(`3. Generated QR code: ${qrCode}`);

      // 4. Create public tracking URL
      const publicUrl = `${
        process.env.API_BASE_URL || "http://localhost:5000"
      }/api/qr/report/${qrCode}`;
      console.log(`4. Public URL: ${publicUrl}`);

      // 5. Generate QR code image (we'll store this in stageCompletions for now)
      const qrImageDataUrl = await QRCode.toDataURL(publicUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      // 6. Create QR tracker record
      const qrTracker = await prisma.qRTracker.create({
        data: {
          qrCode,
          harvestIdentifier: harvest.identifier,
          publicUrl,
          status: "INITIALIZED",
          isPublic: false,
          productName: `${harvest.herbSpecies} Product`, // Default product name
          stageCompletions: {
            qrImageUrl: qrImageDataUrl,
            harvestRecorded: {
              completed: true,
              timestamp: new Date(),
              description: "Harvest recorded and QR code generated",
              location: harvest.location,
              performedBy: harvest.submittedBy.user.email,
              metadata: {
                herbSpecies: harvest.herbSpecies,
                harvestWeight: harvest.harvestWeightKg,
                harvestSeason: harvest.harvestSeason,
                farmerId: harvest.submittedBy.user.id,
                farmerName: harvest.submittedBy.user.fullName,
                fpoName: harvest.submittedBy.fpoName,
              },
            },
          },
        },
      });

      console.log(`6. QR tracker created with ID: ${qrTracker.id}`);

      // 7. Create initial tracking entry - simplified approach
      console.log(`7. QR tracker initialization completed`);
      console.log(`=== QR INITIALIZATION SUCCESS ===`);

      return {
        qrCode: qrTracker.qrCode,
        qrImageUrl: qrTracker.stageCompletions?.qrImageUrl || null,
        publicUrl: qrTracker.publicUrl,
        status: qrTracker.status,
        productName: qrTracker.productName,
        batchId: qrTracker.batchId,
      };
    } catch (error) {
      console.error("=== QR INITIALIZATION ERROR ===");
      console.error("Error details:", error);
      throw error;
    }
  }

  /**
   * Update QR tracking with manufacturing data
   * @param {string} harvestIdentifier - The harvest identifier
   * @param {Object} manufacturingData - Manufacturing data
   * @returns {Object} Updated QR tracking data
   */
  async updateWithManufacturing(harvestIdentifier, manufacturingData) {
    try {
      console.log(
        `=== QR MANUFACTURING UPDATE START for ${harvestIdentifier} ===`
      );

      // 1. Find existing QR tracker
      const qrTracker = await prisma.qRTracker.findFirst({
        where: { harvestIdentifier },
      });

      if (!qrTracker) {
        throw new Error(
          `QR tracker not found for harvest identifier: ${harvestIdentifier}`
        );
      }

      console.log(`1. Found QR tracker: ${qrTracker.qrCode}`);

      // 2. Get current stage completions
      const currentCompletions = qrTracker.stageCompletions || {};

      // 3. Add manufacturing stage completion
      currentCompletions.manufacturing = {
        completed: true,
        timestamp: new Date(),
        description: "Manufacturing process completed",
        performedBy: manufacturingData.manufacturerEmail,
        metadata: {
          manufacturingReportId: manufacturingData.manufacturingReportId,
          manufacturingIdentifier: manufacturingData.manufacturingIdentifier,
          batchId: manufacturingData.batchId,
          herbUsed: manufacturingData.herbUsed,
          quantityUsedKg: manufacturingData.quantityUsedKg,
          processingSteps: manufacturingData.processingSteps,
          manufacturerName: manufacturingData.manufacturerName,
          manufacturerEmail: manufacturingData.manufacturerEmail,
        },
      };

      console.log(`3. Added manufacturing stage completion`);

      // 4. Update QR tracker
      const updatedTracker = await prisma.qRTracker.update({
        where: { id: qrTracker.id },
        data: {
          status: "MANUFACTURING",
          productName: manufacturingData.productName || qrTracker.productName,
          batchId: manufacturingData.batchId,
          stageCompletions: currentCompletions,
          updatedAt: new Date(),
        },
      });

      console.log(`4. QR tracker updated successfully`);
      console.log(`=== QR MANUFACTURING UPDATE SUCCESS ===`);

      return {
        qrCode: updatedTracker.qrCode,
        status: updatedTracker.status,
        productName: updatedTracker.productName,
        batchId: updatedTracker.batchId,
        publicUrl: updatedTracker.publicUrl,
        stageCompletions: updatedTracker.stageCompletions,
      };
    } catch (error) {
      console.error("=== QR MANUFACTURING UPDATE ERROR ===");
      console.error("Error details:", error);
      throw error;
    }
  }

  /**
   * Fetches all data and generates a PDF report as a Buffer.
   * @param {string} qrCode The QR code to generate a report for.
   * @returns {Promise<Buffer>} A promise that resolves with the PDF buffer.
   */
  async generateReportAsPDF(qrCode) {
    let browser;
    try {
      const trackingInfo = await this.getTrackingInfo(qrCode);

      if (!trackingInfo.isPublic) {
        throw new Error("This report is not available to the public yet.");
      }

      const htmlContent = generateReportHTML(trackingInfo);

      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: "networkidle0" });
      const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

      return pdfBuffer;
    } catch (error) {
      console.error("PDF Generation Service Error:", error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Update QR tracking with lab testing data
   * @param {string} harvestIdentifier - The harvest identifier
   * @param {Object} labData - Lab testing data
   * @returns {Object} Updated QR tracking data
   */
  async updateWithLabTesting(harvestIdentifier, labData) {
    try {
      console.log(`=== QR LAB UPDATE START for ${harvestIdentifier} ===`);

      // 1. Find existing QR tracker
      const qrTracker = await prisma.qRTracker.findFirst({
        where: { harvestIdentifier },
      });

      if (!qrTracker) {
        throw new Error(
          `QR tracker not found for harvest identifier: ${harvestIdentifier}`
        );
      }

      console.log(`1. Found QR tracker: ${qrTracker.qrCode}`);

      // 2. Get current stage completions
      const currentCompletions = qrTracker.stageCompletions || {};

      // 3. Add lab testing stage completion
      currentCompletions.labTesting = {
        completed: true,
        timestamp: new Date(),
        description: "Laboratory testing completed",
        performedBy: labData.labEmail,
        metadata: {
          labReportId: labData.labReportId,
          labIdentifier: labData.labIdentifier,
          testType: labData.testType,
          testResult: labData.testResult,
          labName: labData.labName,
          labEmail: labData.labEmail,
          reportFileUrl: labData.reportFileUrl,
        },
      };

      console.log(`3. Added lab testing stage completion`);

      // 4. Determine new status - if we have both manufacturing and lab, mark as completed
      let newStatus = "TESTING";
      if (currentCompletions.manufacturing && currentCompletions.labTesting) {
        newStatus = "COMPLETED";
      }

      // 5. Update QR tracker
      const updatedTracker = await prisma.qRTracker.update({
        where: { id: qrTracker.id },
        data: {
          status: newStatus,
          stageCompletions: currentCompletions,
          updatedAt: new Date(),
          // Make public if all stages are completed
          ...(newStatus === "COMPLETED" && {
            isPublic: true,
            status: "PUBLIC",
          }),
        },
      });

      console.log(`4. QR tracker updated successfully`);
      console.log(`=== QR LAB UPDATE SUCCESS ===`);

      return {
        qrCode: updatedTracker.qrCode,
        status: updatedTracker.status,
        productName: updatedTracker.productName,
        batchId: updatedTracker.batchId,
        publicUrl: updatedTracker.publicUrl,
        stageCompletions: updatedTracker.stageCompletions,
        isPublic: updatedTracker.isPublic,
      };
    } catch (error) {
      console.error("=== QR LAB UPDATE ERROR ===");
      console.error("Error details:", error);
      throw error;
    }
  }

  /**
   * Generate a unique QR code
   * @returns {string} Unique QR code
   */
  generateQRCode() {
    return crypto.randomBytes(16).toString("hex").toUpperCase();
  }

  /**
   * Generate QR code image
   * @param {string} qrCode - The QR code
   * @param {string} publicUrl - The public tracking URL
   * @returns {string} QR image data URL
   */
  async generateQRImage(qrCode, publicUrl) {
    try {
      const qrImageDataUrl = await QRCode.toDataURL(publicUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      return qrImageDataUrl;
    } catch (error) {
      console.error("Error generating QR image:", error);
      throw error;
    }
  }

  /**
   * Add tracking entry for a QR code (simplified for current schema)
   * @param {string} qrCode - The QR code
   * @param {Object} trackingData - Tracking data
   */
  async addTrackingEntry(qrCode, trackingData) {
    try {
      // Find the QR tracker
      const qrTracker = await prisma.qRTracker.findUnique({
        where: { qrCode },
      });

      if (!qrTracker) {
        throw new Error(`QR tracker not found for code: ${qrCode}`);
      }

      // Update stage completions in the QR tracker
      const currentCompletions = qrTracker.stageCompletions || {};
      currentCompletions[trackingData.stage] = {
        completed: true,
        timestamp: new Date(),
        description: trackingData.description,
        location: trackingData.location,
        performedBy: trackingData.performedBy,
        metadata: trackingData.metadata || {},
      };

      // Determine new status based on stage
      let newStatus = qrTracker.status;
      if (trackingData.stage === "manufacturing") {
        newStatus = "MANUFACTURING";
      } else if (trackingData.stage === "testing") {
        newStatus = "TESTING";
      } else if (trackingData.stage === "completed") {
        newStatus = "COMPLETED";
      }

      // Update QR tracker with new stage completion
      const updatedTracker = await prisma.qRTracker.update({
        where: { id: qrTracker.id },
        data: {
          stageCompletions: currentCompletions,
          updatedAt: new Date(),
          status: newStatus,
          // Update product name and batch ID if provided
          ...(trackingData.productName && {
            productName: trackingData.productName,
          }),
          ...(trackingData.batchId && { batchId: trackingData.batchId }),
        },
      });

      return {
        success: true,
        stage: trackingData.stage,
        qrTracker: updatedTracker,
      };
    } catch (error) {
      console.error("Error adding tracking entry:", error);
      throw error;
    }
  }

  /**
   * Get tracking information for a QR code
   * @param {string} qrCode - The QR code
   * @returns {Object} Tracking information
   */
  async getTrackingInfo(qrCode) {
    try {
      const qrTracker = await prisma.qRTracker.findUnique({
        where: { qrCode },
      });

      if (!qrTracker) {
        throw new Error(`QR tracker not found for code: ${qrCode}`);
      }

      // Get harvest information using the harvestIdentifier
      const harvest = await prisma.harvest.findUnique({
        where: { identifier: qrTracker.harvestIdentifier },
        include: {
          submittedBy: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!harvest) {
        throw new Error(
          `Harvest not found for identifier: ${qrTracker.harvestIdentifier}`
        );
      }

      // Get manufacturing report if exists
      const manufacturingReport = await prisma.manufacturingReport.findFirst({
        where: { harvestIdentifier: qrTracker.harvestIdentifier },
        include: {
          createdBy: {
            include: {
              user: true,
            },
          },
        },
      });

      // Get lab report if exists
      const labReport = await prisma.labReport.findFirst({
        where: { harvestIdentifier: qrTracker.harvestIdentifier },
        include: {
          createdBy: {
            include: {
              user: true,
            },
          },
        },
      });

      return {
        qrCode: qrTracker.qrCode,
        status: qrTracker.status,
        isPublic: qrTracker.isPublic,
        productName: qrTracker.productName,
        batchId: qrTracker.batchId,
        qrImageUrl: qrTracker.stageCompletions?.qrImageUrl || null,
        harvest: {
          identifier: harvest.identifier,
          herbSpecies: harvest.herbSpecies,
          harvestWeightKg: harvest.harvestWeightKg,
          harvestSeason: harvest.harvestSeason,
          location: harvest.location,
          farmer: {
            name: harvest.submittedBy.user.fullName,
            email: harvest.submittedBy.user.email,
            fpoName: harvest.submittedBy.fpoName,
          },
        },
        manufacturing: manufacturingReport
          ? {
              identifier: manufacturingReport.identifier,
              batchId: manufacturingReport.batchId,
              herbUsed: manufacturingReport.herbUsed,
              quantityUsedKg: manufacturingReport.quantityUsedKg,
              processingSteps: manufacturingReport.processingSteps,
              status: manufacturingReport.status,
              manufacturer: {
                name: manufacturingReport.createdBy.user.fullName,
                email: manufacturingReport.createdBy.user.email,
                manufacturerName:
                  manufacturingReport.createdBy.manufacturerName,
              },
              effectiveDate: manufacturingReport.effectiveDate,
              expiryDate: manufacturingReport.expiryDate,
            }
          : null,
        labTesting: labReport
          ? {
              identifier: labReport.identifier,
              testType: labReport.testType,
              testResult: labReport.testResult,
              status: labReport.status,
              labReportFileUrl: labReport.labReportFileUrl,
              laboratory: {
                name: labReport.createdBy.user.fullName,
                email: labReport.createdBy.user.email,
                labName: labReport.createdBy.labName,
              },
              issuedDate: labReport.issuedDate,
            }
          : null,
        stageCompletions: qrTracker.stageCompletions || {},
        createdAt: qrTracker.createdAt,
        updatedAt: qrTracker.updatedAt,
      };
    } catch (error) {
      console.error("Error getting tracking info:", error);
      throw error;
    }
  }

  /**
   * Make QR code public for tracking
   * @param {string} qrCode - The QR code
   * @returns {Object} Updated QR tracker
   */
  async makePublic(qrCode) {
    try {
      const qrTracker = await prisma.qRTracker.update({
        where: { qrCode },
        data: {
          isPublic: true,
          status: "PUBLIC",
          updatedAt: new Date(),
        },
      });

      return qrTracker;
    } catch (error) {
      console.error("Error making QR code public:", error);
      throw error;
    }
  }

  /**
   * Get QR tracker by harvest identifier
   * @param {string} harvestIdentifier - The harvest identifier
   * @returns {Object|null} QR tracker or null
   */
  async getQRTrackerByHarvestIdentifier(harvestIdentifier) {
    try {
      return await prisma.qRTracker.findFirst({
        where: { harvestIdentifier },
      });
    } catch (error) {
      console.error("Error getting QR tracker by harvest identifier:", error);
      throw error;
    }
  }

  /**
   * Get QR history for farmer
   * @param {string} farmerProfileId - The farmer profile ID
   * @returns {Array} QR history
   */
  async getFarmerQRHistory(farmerProfileId) {
    try {
      // First get all harvests for this farmer
      const harvests = await prisma.harvest.findMany({
        where: { farmerProfileId },
        select: { identifier: true, herbSpecies: true, createdAt: true },
      });

      if (harvests.length === 0) {
        return [];
      }

      // Get QR trackers for these harvests
      const qrTrackers = await prisma.qRTracker.findMany({
        where: {
          harvestIdentifier: {
            in: harvests.map((h) => h.identifier),
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      // Combine harvest and QR data
      return qrTrackers.map((qr) => {
        const harvest = harvests.find(
          (h) => h.identifier === qr.harvestIdentifier
        );
        return {
          qrCode: qr.qrCode,
          status: qr.status,
          isPublic: qr.isPublic,
          productName:
            qr.productName || harvest?.herbSpecies || "Unknown Product",
          batchId: qr.batchId,
          publicUrl: qr.publicUrl,
          harvestIdentifier: qr.harvestIdentifier,
          herbSpecies: harvest?.herbSpecies,
          createdAt: qr.createdAt,
          updatedAt: qr.updatedAt,
        };
      });
    } catch (error) {
      console.error("Error getting farmer QR history:", error);
      throw error;
    }
  }

  /**
   * Regenerate QR code for a harvest
   * @param {string} harvestIdentifier - The harvest identifier
   * @returns {Object} New QR tracking data
   */
  async regenerateQR(harvestIdentifier) {
    try {
      console.log(`=== QR REGENERATION START for ${harvestIdentifier} ===`);

      // Find existing QR tracker
      const existingTracker = await prisma.qRTracker.findFirst({
        where: { harvestIdentifier },
      });

      if (existingTracker) {
        // Delete existing tracker
        await prisma.qRTracker.delete({
          where: { id: existingTracker.id },
        });
        console.log(`Deleted existing QR tracker: ${existingTracker.qrCode}`);
      }

      // Create new QR tracker
      const newQRData = await this.initializeFromHarvest(harvestIdentifier);

      console.log(`=== QR REGENERATION SUCCESS ===`);
      return newQRData;
    } catch (error) {
      console.error("=== QR REGENERATION ERROR ===");
      console.error("Error details:", error);
      throw error;
    }
  }

  /**
   * Clean up - close Prisma connection
   */
  async disconnect() {
    await prisma.$disconnect();
  }
}

// Export singleton instance
export default new QRTrackingService();

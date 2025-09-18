// controllers/labController.js
import { PrismaClient } from "@prisma/client";
import cloudinary from "../config/cloudinaryConfig.js";

const prisma = new PrismaClient();

export const createLabReport = async (req, res) => {
  try {
    const { batchId, testType, testResult, notes, regulatoryTags } = req.body;

    const identifier = `LAB-${batchId}-${Date.now().toString().slice(-6)}`;

    if (!req.file) {
      return res.status(400).json({ message: "Lab report file is required." });
    }

    const manufacturingReport = await prisma.manufacturingReport.findUnique({
      where: { batchId },
    });
    if (!manufacturingReport) {
      return res.status(404).json({
        message: `No manufacturing report found with Batch ID: ${batchId}`,
      });
    }

    const laboratoryProfile = await prisma.laboratoryProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!laboratoryProfile) {
      return res.status(403).json({
        message: "User is not a Laboratory user or profile not found.",
      });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "lab_reports" },
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const newLabReport = await prisma.labReport.create({
      data: {
        identifier,
        testType,
        testResult,
        labReportFileUrl: result.secure_url,
        laboratoryProfileId: laboratoryProfile.id,
        manufacturingReportId: manufacturingReport.id,
        notes,
        regulatoryTags: Array.isArray(regulatoryTags)
          ? regulatoryTags
          : regulatoryTags
          ? [regulatoryTags]
          : [],
      },
    });

    res.status(201).json(newLabReport);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({
        message:
          "A lab report for this batch or a report with this identifier already exists.",
      });
    }
    console.error(error);
    res.status(500).json({
      message: "Server error while creating lab report.",
      error: error.message,
    });
  }
};

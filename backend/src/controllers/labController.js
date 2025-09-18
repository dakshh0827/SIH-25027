import { PrismaClient } from "@prisma/client";
import cloudinary from "../config/cloudinaryConfig.js";

const prisma = new PrismaClient();

export const createLabReport = async (req, res) => {
  try {
    const { 
      manufacturingReportId, 
      testType, 
      testResult, 
      status,
      effectiveDate,
      issuedDate,
      notes, 
      regulatoryTags 
    } = req.body;

    const identifier = `LAB-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    if (!req.file) {
      return res.status(400).json({ message: "Lab report file is required." });
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
        { 
          folder: "lab_reports",
          resource_type: "auto"
        },
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    let parsedTags = [];
    if (regulatoryTags) {
      try {
        parsedTags = typeof regulatoryTags === 'string' ? JSON.parse(regulatoryTags) : regulatoryTags;
      } catch (e) {
        parsedTags = Array.isArray(regulatoryTags) ? regulatoryTags : [regulatoryTags];
      }
    }

    const newLabReport = await prisma.labReport.create({
      data: {
        identifier,
        testType,
        testResult,
        status: status || 'final',
        effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
        issuedDate: issuedDate ? new Date(issuedDate) : new Date(),
        labReportFileUrl: result.secure_url,
        laboratoryProfileId: laboratoryProfile.id,
        manufacturingReportId: manufacturingReportId, // Use the string ID directly
        notes: notes || '',
        regulatoryTags: parsedTags,
      },
      include: {
        // FIXED: The `manufacturingReport` include is removed.
        createdBy: {
          select: {
            id: true,
            labName: true,
            nablAccreditationNumber: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Lab report created successfully',
      data: newLabReport
    });

  } catch (error) {
    console.error('Error creating lab report:', error);
    res.status(500).json({
      success: false,
      message: "Server error while creating lab report.",
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
        message: "Laboratory profile not found for this user." 
      });
    }

    const reports = await prisma.labReport.findMany({
      where: { laboratoryProfileId: laboratoryProfile.id },
      orderBy: { createdAt: "desc" },
      include: {
        // FIXED: The `manufacturingReport` include is removed.
        createdBy: {
          select: {
            id: true,
            labName: true,
            nablAccreditationNumber: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        }
      },
    });

    const formattedReports = reports.map(report => ({
      id: report.id,
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
      manufacturingReportId: report.manufacturingReportId, // Use the string ID directly
      laboratoryProfile: report.createdBy, 
      createdBy: report.createdBy?.user,
      identifier: report.identifier
    }));

    res.status(200).json({
      success: true,
      count: formattedReports.length,
      data: formattedReports
    });

  } catch (error) {
    console.error('Error fetching lab history:', error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching lab history.",
      error: error.message,
    });
  }
};
// controllers/adminController.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllHarvestReports = async (req, res) => {
  try {
    const reports = await prisma.harvest.findMany({
      include: {
        submittedBy: {
          select: {
            fpoName: true,
            authorizedRepresentative: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Return data in consistent format expected by frontend
    res.status(200).json({ data: reports, count: reports.length });
  } catch (error) {
    console.error("Error fetching harvest reports:", error);
    res
      .status(500)
      .json({
        message: "Failed to fetch harvest reports",
        error: error.message,
      });
  }
};

export const getAllManufacturingReports = async (req, res) => {
  try {
    const reports = await prisma.manufacturingReport.findMany({
      include: {
        createdBy: {
          select: {
            manufacturerName: true,
            authorizedRepresentative: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Return data in consistent format expected by frontend
    res.status(200).json({ data: reports, count: reports.length });
  } catch (error) {
    console.error("Error fetching manufacturing reports:", error);
    res
      .status(500)
      .json({
        message: "Failed to fetch manufacturing reports",
        error: error.message,
      });
  }
};

export const getAllLabReports = async (req, res) => {
  try {
    const reports = await prisma.labReport.findMany({
      include: {
        createdBy: {
          select: {
            labName: true,
            authorizedRepresentative: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Return data in consistent format expected by frontend
    res.status(200).json({ data: reports, count: reports.length });
  } catch (error) {
    console.error("Error fetching lab reports:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch lab reports", error: error.message });
  }
};

// Optional: System statistics
export const getSystemStats = async (req, res) => {
  try {
    const [harvestCount, manufacturingCount, labCount] = await Promise.all([
      prisma.harvest.count(),
      prisma.manufacturingReport.count(),
      prisma.labReport.count(),
    ]);

    res.status(200).json({
      data: {
        harvestReports: harvestCount,
        manufacturingReports: manufacturingCount,
        labReports: labCount,
        total: harvestCount + manufacturingCount + labCount,
      },
    });
  } catch (error) {
    console.error("Error fetching system stats:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch system stats", error: error.message });
  }
};
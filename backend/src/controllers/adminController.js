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
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching harvest reports:", error);
    res.status(500).json({ message: "Failed to fetch harvest reports", error });
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
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching manufacturing reports:", error);
    res.status(500).json({ message: "Failed to fetch manufacturing reports", error });
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
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching lab reports:", error);
    res.status(500).json({ message: "Failed to fetch lab reports", error });
  }
};

// Optional: System statistics
export const getSystemStats = async (req, res) => {
  try {
    const harvestCount = await prisma.harvest.count();
    const manufacturingCount = await prisma.manufacturingReport.count();
    const labCount = await prisma.labReport.count();

    res.status(200).json({
      harvestReports: harvestCount,
      manufacturingReports: manufacturingCount,
      labReports: labCount
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch system stats", error });
  }
};
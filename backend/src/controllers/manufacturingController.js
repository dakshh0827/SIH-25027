import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createManufacturingReport = async (req, res) => {
  try {
    const {
      herbUsed,
      quantityUsedKg,
      processingSteps,
      status = "in-progress", // Default value
      effectiveDate,
      expiryDate,
      notes,
      regulatoryTags,
    } = req.body;

    // Generate batch ID and identifier
    const date = new Date();
    const batchId = `${herbUsed
      .substring(0, 4)
      .toUpperCase()}-${date.getFullYear()}${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${Date.now().toString().slice(-4)}`;
    const identifier = `MFG-${batchId}`;

    // Find manufacturer profile
    const manufacturerProfile = await prisma.manufacturerProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!manufacturerProfile) {
      return res
        .status(403)
        .json({ message: "User is not a Manufacturer or profile not found." });
    }

    // Create the manufacturing report
    const newReport = await prisma.manufacturingReport.create({
      data: {
        identifier,
        batchId,
        herbUsed,
        quantityUsedKg: parseFloat(quantityUsedKg),
        processingSteps,
        status,
        manufacturerProfileId: manufacturerProfile.id,
        effectiveDate: new Date(effectiveDate), // Convert string to Date
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        notes: notes || null,
        regulatoryTags: Array.isArray(regulatoryTags)
          ? regulatoryTags
          : regulatoryTags
          ? [regulatoryTags]
          : [],
      },
    });

    res.status(201).json({
      success: true,
      data: newReport
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({
        message: `A report with this Identifier or Batch ID already exists.`,
      });
    }
    console.error('Manufacturing report creation error:', error);
    res.status(500).json({
      message: "Server error while creating report.",
      error: error.message,
    });
  }
};

export const getManufacturingHistory = async (req, res) => {
  try {
    const manufacturerProfile = await prisma.manufacturerProfile.findUnique({
      where: { userId: req.user.id },
    });
    
    if (!manufacturerProfile) {
      return res
        .status(403)
        .json({ message: "Manufacturer profile not found for this user." });
    }
    
    const reports = await prisma.manufacturingReport.findMany({
      where: { manufacturerProfileId: manufacturerProfile.id },
      orderBy: { createdAt: "desc" },
    });
    
    res.status(200).json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Manufacturing history fetch error:', error);
    res.status(500).json({
      message: "Server error while fetching manufacturing history.",
      error: error.message,
    });
  }
};
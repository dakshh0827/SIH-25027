// controllers/manufacturingController.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createManufacturingReport = async (req, res) => {
  try {
    const {
      identifier,
      batchId,
      herbUsed,
      quantityUsedKg,
      processingSteps,
      expiryDate,
      notes,
      regulatoryTags,
    } = req.body;

    const manufacturerProfile = await prisma.manufacturerProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!manufacturerProfile) {
      return res
        .status(403)
        .json({ message: "User is not a Manufacturer or profile not found." });
    }

    const newReport = await prisma.manufacturingReport.create({
      data: {
        identifier,
        batchId,
        herbUsed,
        quantityUsedKg: parseFloat(quantityUsedKg),
        processingSteps,
        manufacturerProfileId: manufacturerProfile.id,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        notes,
        regulatoryTags: Array.isArray(regulatoryTags)
          ? regulatoryTags
          : regulatoryTags
          ? [regulatoryTags]
          : [],
      },
    });

    res.status(201).json(newReport);
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({
          message: `A report with this Identifier or Batch ID already exists.`,
        });
    }
    console.error(error);
    res
      .status(500)
      .json({
        message: "Server error while creating report.",
        error: error.message,
      });
  }
};

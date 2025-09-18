// controllers/harvestController.js
import { PrismaClient } from "@prisma/client";
import cloudinary from "../config/cloudinaryConfig.js";

const prisma = new PrismaClient();

export const createHarvest = async (req, res) => {
  try {
    const {
      herbSpecies,
      harvestWeightKg,
      harvestSeason,
      location,
      notes,
      regulatoryTags,
    } = req.body;

    const identifier = `HARV-${herbSpecies
      .substring(0, 4)
      .toUpperCase()}-${new Date().getFullYear()}-${Date.now()
      .toString()
      .slice(-6)}`;

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Harvest proof image is required." });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "harvest_proofs" },
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const farmerProfile = await prisma.farmerProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!farmerProfile) {
      return res
        .status(403)
        .json({ message: "User is not a farmer or profile not found." });
    }

    const newHarvest = await prisma.harvest.create({
      data: {
        identifier,
        herbSpecies,
        harvestWeightKg: parseFloat(harvestWeightKg),
        harvestSeason,
        location,
        harvestProofUrl: result.secure_url,
        farmerProfileId: farmerProfile.id,
        notes,
        // Ensure regulatoryTags is always an array
        regulatoryTags: Array.isArray(regulatoryTags)
          ? regulatoryTags
          : regulatoryTags
          ? [regulatoryTags]
          : [],
      },
    });

    res.status(201).json(newHarvest);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error while creating harvest.",
      error: error.message,
    });
  }
};

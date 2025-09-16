// src/controllers/authController.js
import { PrismaClient } from "@prisma/client";
import { uploadToCloudinary } from "../config/upload.js";
import {
  hashPassword,
  comparePassword,
  generateStepToken,
  generateLoginToken,
} from "../utils/authUtils.js";

const prisma = new PrismaClient();

// Step 1: Handle Personal Details
export const registerStep1 = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: "Full name, email, and password are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await hashPassword(password);
    const step1Token = generateStepToken({ fullName, email, hashedPassword });

    res.status(200).json({
      message: "Step 1 complete. Proceed to the next step.",
      step1Token,
    });
  } catch (error) {
    console.error("Error in registerStep1:", error);
    res.status(500).json({ message: "An internal server error occurred" });
  }
};

// Step 2 (Admin Path): Handle Admin Details & Finalize
export const registerAdmin = async (req, res) => {
  try {
    const { nccrGovtId, metamaskAddress } = req.body;
    const { fullName, email, hashedPassword } = req.stepData;

    if (!req.file) {
      return res.status(400).json({ message: "ID proof file is required" });
    }

    // Upload file to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer);
    const idProofUrl = uploadResult.secure_url;

    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role: "ADMIN",
        adminProfile: {
          create: { nccrGovtId, metamaskAddress, idProofUrl },
        },
      },
      include: { adminProfile: true },
    });

    const loginToken = generateLoginToken(newUser.id);
    res.status(201).json({
      message: "Admin registration successful!",
      user: newUser,
      loginToken,
    });
  } catch (error) {
    console.error("Error in registerAdmin:", error);
    res.status(500).json({ message: "Admin registration failed" });
  }
};

// Step 3 (NGO/Panchayat Path): Handle Specific Details
export const registerStep3 = async (req, res) => {
  try {
    const { type, ...details } = req.body;
    const { fullName, email, hashedPassword } = req.stepData;

    if (!req.file) {
      return res.status(400).json({ message: "Document upload is required" });
    }

    // Upload file to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer);
    const documentUrl = uploadResult.secure_url;

    let newUser;
    if (type === "NGO") {
      newUser = await prisma.user.create({
        data: {
          fullName,
          email,
          password: hashedPassword,
          role: "NGO",
          ngoProfile: {
            create: {
              ...details,
              yearOfEstablishment: parseInt(details.yearOfEstablishment),
              registrationCertificateUrl: documentUrl, // Save the URL
            },
          },
        },
      });
    } else if (type === "PANCHAYAT") {
      newUser = await prisma.user.create({
        data: {
          fullName,
          email,
          password: hashedPassword,
          role: "PANCHAYAT",
          panchayatProfile: {
            create: {
              ...details,
              authorizedRepresentativeIdProofUrl: documentUrl, // Save the URL
            },
          },
        },
      });
    } else {
      return res
        .status(400)
        .json({ message: "Invalid account type specified" });
    }

    const step3Token = generateStepToken({ userId: newUser.id });
    res
      .status(200)
      .json({ message: "Step 3 complete. Proceed to final step.", step3Token });
  } catch (error) {
    console.error("Error in registerStep3:", error);
    res.status(500).json({ message: "An internal server error occurred" });
  }
};

// Step 4 (NGO/Panchayat Path): Handle Common Details & Finalize
export const registerCommon = async (req, res) => {
  try {
    const commonDetails = req.body;
    const { userId } = req.stepData;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        commonProfile: {
          create: {
            ...commonDetails,
            latitude: parseFloat(commonDetails.latitude),
            longitude: parseFloat(commonDetails.longitude),
          },
        },
      },
      include: {
        commonProfile: true,
        ngoProfile: true,
        panchayatProfile: true,
      },
    });

    const loginToken = generateLoginToken(updatedUser.id);
    res.status(201).json({
      message: "Registration complete!",
      user: updatedUser,
      loginToken,
    });
  } catch (error) {
    console.error("Error in registerCommon:", error);
    res.status(500).json({ message: "Final registration step failed" });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await comparePassword(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const loginToken = generateLoginToken(user.id);

    res.status(200).json({
      message: "Login successful!",
      loginToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "An internal server error occurred" });
  }
};

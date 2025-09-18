import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinaryConfig.js";

const prisma = new PrismaClient();

export const register = async (req, res) => {
  try {
    const { role, fullName, email, password, ...profileData } = req.body;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    if (role === "admin") {
      if (!req.file) {
        return res.status(400).json({ message: "Admin ID proof is required." });
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "id_proofs" },
          (error, result) => {
            if (error) reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      profileData.idProofUrl = result.secure_url;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName,
          email,
          password: hashedPassword,
          role: role, // Use the lowercase role directly
        },
      });

      const profileInfo = { ...profileData, userId: user.id };

      // --- THIS IS THE CORRECTED LOGIC ---
      switch (role) {
        case "farmer":
          await tx.farmerProfile.create({ data: profileInfo });
          break;
        case "manufacturer":
          await tx.manufacturerProfile.create({ data: profileInfo });
          break;
        case "lab":
          await tx.laboratoryProfile.create({ data: profileInfo });
          break;
        case "admin":
          await tx.adminProfile.create({ data: profileInfo });
          break;
        default:
          throw new Error("Invalid role specified for profile creation.");
      }
      return user;
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error during registration.",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      message: "Logged in successfully",
      token,
      user: { id: user.id, fullName: user.fullName, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during login." });
  }
};

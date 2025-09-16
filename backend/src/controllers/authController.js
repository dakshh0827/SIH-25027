import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinaryConfig.js";

const prisma = new PrismaClient();

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    // Data has already been validated by the Zod middleware
    const { role, fullName, email, password, ...profileData } = req.body;

    // Check if a user with the given email already exists
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    // Handle Admin ID proof upload to Cloudinary if it exists
    if (role === "ADMIN") {
      if (!req.file) {
        return res.status(400).json({ message: "Admin ID proof is required." });
      }

      // Upload file buffer to Cloudinary
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

      // Add the secure URL to the profile data that will be saved
      profileData.idProofUrl = result.secure_url;
    }

    // Hash the user's password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user and their specific profile in a single transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName,
          email,
          password: hashedPassword,
          role: Role[role],
        },
      });

      const profileInfo = { ...profileData, userId: user.id };

      switch (role) {
        case "FPO":
          await tx.fpoProfile.create({ data: profileInfo });
          break;
        case "MANUFACTURER":
          await tx.manufacturerProfile.create({ data: profileInfo });
          break;
        case "LABORATORY":
          await tx.laboratoryProfile.create({ data: profileInfo });
          break;
        case "ADMIN":
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

/**
 * @desc    Authenticate a user and get token
 * @route   POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    // Data has already been validated by the Zod middleware
    const { email, password } = req.body;

    // Find the user by their email address
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create JWT payload
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    // Sign and generate the token
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

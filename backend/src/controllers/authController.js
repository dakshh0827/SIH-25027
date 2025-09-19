import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinaryConfig.js";

const prisma = new PrismaClient();

export const register = async (req, res) => {
  try {
    const { role, fullName, email, password, ...specificProfileData } = req.body;

    // Check if user with this email already exists
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Use a transaction to ensure both user and profile are created or neither are
    const result = await prisma.$transaction(async (tx) => {
      // Create the User record first
      const user = await tx.user.create({
        data: {
          fullName,
          email,
          password: hashedPassword,
          role: role,
        },
      });

      let profile = null;

      // Based on the role, create the corresponding profile record
      switch (role) {
        case "farmer":
          profile = await tx.farmerProfile.create({
            data: {
              userId: user.id,
              fpoName: specificProfileData.fpoName,
              regNumber: specificProfileData.regNumber,
              pan: specificProfileData.pan,
              gstin: specificProfileData.gstin,
              registeredAddress: specificProfileData.registeredAddress,
              authorizedRepresentative: specificProfileData.authorizedRepresentative,
            },
          });
          break;

        case "manufacturer":
          profile = await tx.manufacturerProfile.create({
            data: {
              userId: user.id,
              manufacturerName: specificProfileData.manufacturerName,
              ayushLicenseNumber: specificProfileData.ayushLicenseNumber,
              registrationNumber: specificProfileData.registrationNumber, // Corrected field name
              pan: specificProfileData.pan,
              gstin: specificProfileData.gstin,
              registeredAddress: specificProfileData.registeredAddress,
              authorizedRepresentative: specificProfileData.authorizedRepresentative,
            },
          });
          break;

        case "lab":
          profile = await tx.laboratoryProfile.create({
            data: {
              userId: user.id,
              labName: specificProfileData.labName,
              nablAccreditationNumber: specificProfileData.nablAccreditationNumber,
              scopeOfNablAccreditation: specificProfileData.scopeOfNablAccreditation,
              pan: specificProfileData.pan,
              gstin: specificProfileData.gstin,
              registeredAddress: specificProfileData.registeredAddress,
              authorizedRepresentative: specificProfileData.authorizedRepresentative,
            },
          });
          break;

        case "admin":
          // Key Fix: All admin-specific logic, including file upload, is now here.
          if (!req.file) {
            throw new Error("Admin ID proof image is required.");
          }

          // 1. Upload file to Cloudinary
          const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "admin_proofs" },
              (error, result) => {
                if (error) return reject(new Error("Cloudinary upload failed."));
                resolve(result);
              }
            );
            stream.end(req.file.buffer);
          });

          // 2. Create the admin profile with the uploaded URL
          profile = await tx.adminProfile.create({
            data: {
              userId: user.id,
              adminId: `ADM-${user.id.slice(-6).toUpperCase()}`,
              idProofUrl: uploadResult.secure_url,
            },
          });
          break;

        default:
          throw new Error("Invalid user role specified.");
      }

      return { user, profile };
    });

    // Generate JWT token for automatic login after registration
    const payload = {
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      profileId: result.profile?.id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Return success response
    res.status(201).json({
      message: "User registered and logged in successfully",
      token,
      user: {
        id: result.user.id,
        fullName: result.user.fullName,
        email: result.user.email,
        role: result.user.role,
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // This block ensures any error (from Prisma, Cloudinary, etc.) sends a response
    let message = "Server error during registration.";
    if (error.code === 'P2002') {
        message = "A user with the provided unique details (like PAN, GSTIN, or Email) already exists.";
    } else if (error.message) {
        message = error.message;
    }
    
    res.status(500).json({ message });
  }
};

// ... (login and other functions remain the same, but ensure getProfile for admin selects the new field) ...

// Removed duplicate getProfile function declaration to fix redeclaration error.

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

    // Find the associated profile to include in the payload
    let profile = null;
    switch (user.role) {
      case Role.farmer:
        profile = await prisma.farmerProfile.findUnique({ where: { userId: user.id } });
        break;
      case Role.manufacturer:
        profile = await prisma.manufacturerProfile.findUnique({ where: { userId: user.id } });
        break;
      case Role.lab:
        profile = await prisma.laboratoryProfile.findUnique({ where: { userId: user.id } });
        break;
      case Role.admin:
        profile = await prisma.adminProfile.findUnique({ where: { userId: user.id } });
        break;
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      profileId: profile?.id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      message: "Logged in successfully",
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during login." });
  }
};

export const getProfile = async (req, res) => {
  try {
    // Debug logging
    console.log('req.user:', req.user);
    console.log('req.tokenPayload:', req.tokenPayload);
    
    const userId = req.user.id; // Changed from req.user.userId to req.user.id
    console.log('Extracted userId:', userId);
    
    // First get the user data
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get the profile data based on user role
    let profile = null;
    switch (user.role) {
      case Role.farmer:
        profile = await prisma.farmerProfile.findUnique({ 
          where: { userId: user.id },
          select: {
            id: true,
            fpoName: true,
            regNumber: true,
            pan: true,
            gstin: true,
            registeredAddress: true,
            authorizedRepresentative: true,
            // idProofUrl: true, // Removed - this field doesn't exist in FarmerProfile
            // createdAt: true,
            // updatedAt: true
          }
        });
        break;
      case Role.manufacturer:
        profile = await prisma.manufacturerProfile.findUnique({ 
          where: { userId: user.id },
          select: {
            id: true,
            manufacturerName: true,
            ayushLicenseNumber: true,
            registrationNumber: true,
            pan: true,
            gstin: true,
            registeredAddress: true,
            authorizedRepresentative: true,
          }
        });
        break;
      case Role.lab:
        profile = await prisma.laboratoryProfile.findUnique({ 
          where: { userId: user.id },
          select: {
            id: true,
            labName: true,
            nablAccreditationNumber: true,
            scopeOfNablAccreditation: true,
            pan: true,
            gstin: true,
            registeredAddress: true,
            authorizedRepresentative: true,
          }
        });
        break;
      case Role.admin:
        profile = await prisma.adminProfile.findUnique({ 
          where: { userId: user.id },
          select: {
            id: true,
            idProofUrl: true,
            createdAt: true,
            updatedAt: true
          }
        });
        break;
      default:
        return res.status(400).json({ message: "Invalid user role" });
    }

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({
      message: "Profile retrieved successfully",
      user,
      profile,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: "Server error retrieving profile." });
  }
};

export const logout = async (req, res) => {
  try {
    // Note: With JWT, we can't invalidate the token on the server side
    // The token will remain valid until it expires
    // For better security, you might want to implement a token blacklist
    
    res.json({
      message: "Logged out successfully",
      // Instruct the client to remove the token
      clearToken: true,
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: "Server error during logout." });
  }
};

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinaryConfig.js";

const prisma = new PrismaClient();

export const register = async (req, res) => {
  try {
    const {
      role,
      fullName,
      email,
      password,
      ...specificProfileData
    } = req.body;

    console.log('Registration attempt:', { email, role, regNumber: specificProfileData.regNumber }); // Debug log

    // Check if user with this email already exists
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    // Check for unique constraint violations before creating user
    try {
      switch (role) {
        case "farmer":
          // Check multiple unique fields for farmers
          const existingFarmerByPan = specificProfileData.pan ? 
            await prisma.farmerProfile.findUnique({ where: { pan: specificProfileData.pan } }) : null;
          const existingFarmerByGstin = specificProfileData.gstin ? 
            await prisma.farmerProfile.findFirst({ where: { gstin: specificProfileData.gstin } }) : null;
          const existingFarmerByRegNumber = specificProfileData.regNumber ? 
            await prisma.farmerProfile.findFirst({ where: { regNumber: specificProfileData.regNumber } }) : null;
          
          if (existingFarmerByPan) {
            console.log('Duplicate PAN found:', specificProfileData.pan); // Debug log
            return res.status(400).json({ message: "A farmer with this PAN number already exists." });
          }
          if (existingFarmerByGstin) {
            console.log('Duplicate GSTIN found:', specificProfileData.gstin); // Debug log
            return res.status(400).json({ message: "A farmer with this GSTIN already exists." });
          }
          if (existingFarmerByRegNumber) {
            console.log('Duplicate Registration Number found:', specificProfileData.regNumber); // Debug log
            return res.status(400).json({ message: "A farmer with this registration number already exists." });
          }
          break;
        
        case "manufacturer":
          if (specificProfileData.ayushLicenseNumber) {
            const existingManufacturer = await prisma.manufacturerProfile.findUnique({ 
              where: { ayushLicenseNumber: specificProfileData.ayushLicenseNumber } 
            });
            if (existingManufacturer) {
              return res.status(400).json({ 
                message: "A manufacturer with this AYUSH license number already exists." 
              });
            }
          }
          // Check other manufacturer unique fields
          if (specificProfileData.regNumber) {
            const existingManufacturerByRegNumber = await prisma.manufacturerProfile.findFirst({ 
              where: { regNumber: specificProfileData.regNumber } 
            });
            if (existingManufacturerByRegNumber) {
              return res.status(400).json({ 
                message: "A manufacturer with this registration number already exists." 
              });
            }
          }
          break;
        
        case "lab":
          if (specificProfileData.nablAccreditationNumber) {
            const existingLab = await prisma.laboratoryProfile.findUnique({ 
              where: { nablAccreditationNumber: specificProfileData.nablAccreditationNumber } 
            });
            if (existingLab) {
              return res.status(400).json({ 
                message: "A laboratory with this NABL accreditation number already exists." 
              });
            }
          }
          // Check other lab unique fields
          if (specificProfileData.regNumber) {
            const existingLabByRegNumber = await prisma.laboratoryProfile.findFirst({ 
              where: { regNumber: specificProfileData.regNumber } 
            });
            if (existingLabByRegNumber) {
              return res.status(400).json({ 
                message: "A laboratory with this registration number already exists." 
              });
            }
          }
          break;
      }
    } catch (checkError) {
      console.error('Error checking for existing records:', checkError);
      // Continue with registration attempt - the transaction will catch constraint violations
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Use a transaction to ensure both user and profile are created or neither are
    const result = await prisma.$transaction(async (tx) => {
      let profileData = {};

      // Handle file uploads based on role requirements
      if (req.file) {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "user_proofs" }, // Use a generic folder
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });

        if (role === 'admin' || role === 'farmer' || role === 'manufacturer' || role === 'lab') {
          profileData.idProofUrl = uploadResult.secure_url;
        }
      }

      // Create the User record first
      const user = await tx.user.create({
        data: {
          fullName,
          email,
          password: hashedPassword,
          role: role,
        },
      });

      // Based on the role, build the correct profile data object
      // and create the corresponding profile record
      let profile = null;
      switch (role) {
        case "farmer":
          profileData = {
            fpoName: specificProfileData.fpoName,
            regNumber: specificProfileData.regNumber,
            pan: specificProfileData.pan,
            gstin: specificProfileData.gstin,
            registeredAddress: specificProfileData.registeredAddress,
            authorizedRepresentative: specificProfileData.authorizedRepresentative,
            userId: user.id,
            ...(profileData.idProofUrl && { idProofUrl: profileData.idProofUrl }),
          };
          profile = await tx.farmerProfile.create({ data: profileData });
          break;
          
        case "manufacturer":
          profileData = {
            manufacturerName: specificProfileData.manufacturerName,
            ayushLicenseNumber: specificProfileData.ayushLicenseNumber,
            regNumber: specificProfileData.regNumber,
            pan: specificProfileData.pan,
            gstin: specificProfileData.gstin,
            registeredAddress: specificProfileData.registeredAddress,
            authorizedRepresentative: specificProfileData.authorizedRepresentative,
            userId: user.id,
            ...(profileData.idProofUrl && { idProofUrl: profileData.idProofUrl }),
          };
          profile = await tx.manufacturerProfile.create({ data: profileData });
          break;
          
        case "lab":
          profileData = {
            labName: specificProfileData.labName,
            nablAccreditationNumber: specificProfileData.nablAccreditationNumber,
            scopeOfNablAccreditation: specificProfileData.scopeOfNablAccreditation,
            pan: specificProfileData.pan,
            gstin: specificProfileData.gstin,
            registeredAddress: specificProfileData.registeredAddress,
            authorizedRepresentative: specificProfileData.authorizedRepresentative,
            userId: user.id,
            ...(profileData.idProofUrl && { idProofUrl: profileData.idProofUrl }),
          };
          profile = await tx.laboratoryProfile.create({ data: profileData });
          break;
          
        case "admin":
          profileData = {
            userId: user.id,
            ...(profileData.idProofUrl && { idProofUrl: profileData.idProofUrl }),
          };
          profile = await tx.adminProfile.create({ data: profileData });
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

    // Return both user data and token (similar to login response)
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
    
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      let message = "Registration failed due to duplicate data.";
      
      if (target?.includes('pan')) {
        message = "A user with this PAN number already exists.";
      } else if (target?.includes('gstin')) {
        message = "A user with this GSTIN already exists.";
      } else if (target?.includes('regNumber')) {
        message = "A user with this registration number already exists.";
      } else if (target?.includes('ayushLicenseNumber')) {
        message = "A manufacturer with this AYUSH license number already exists.";
      } else if (target?.includes('nablAccreditationNumber')) {
        message = "A laboratory with this NABL accreditation number already exists.";
      } else if (target?.includes('email')) {
        message = "User with this email already exists.";
      }
      
      return res.status(400).json({ message });
    }
    
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

    // Find the associated profile to include in the payload
    let profile = null;
    switch (user.role) {
      case Role.FARMER:
        profile = await prisma.farmerProfile.findUnique({ where: { userId: user.id } });
        break;
      case Role.MANUFACTURER:
        profile = await prisma.manufacturerProfile.findUnique({ where: { userId: user.id } });
        break;
      case Role.LAB:
        profile = await prisma.laboratoryProfile.findUnique({ where: { userId: user.id } });
        break;
      case Role.ADMIN:
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
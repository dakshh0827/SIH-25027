import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Enhanced middleware to protect routes (checks for a valid token)
export const protect = async (req, res, next) => {
  let token;

  // Check for authorization header with Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database with fresh data
      req.user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!req.user) {
        return res.status(401).json({
          message: "User not found - token may be invalid",
          code: "USER_NOT_FOUND",
        });
      }

      // Add token payload to request for additional info if needed
      req.tokenPayload = decoded;

      next();
    } catch (error) {
      console.error("Token verification error:", error);

      // Handle specific JWT errors
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Token expired - please login again",
          code: "TOKEN_EXPIRED",
        });
      } else if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          message: "Invalid token format",
          code: "INVALID_TOKEN",
        });
      } else if (error.name === "NotBeforeError") {
        return res.status(401).json({
          message: "Token not active yet",
          code: "TOKEN_NOT_ACTIVE",
        });
      }

      return res.status(401).json({
        message: "Not authorized - token verification failed",
        code: "TOKEN_VERIFICATION_FAILED",
      });
    }
  } else {
    return res.status(401).json({
      message: "Not authorized - no token provided",
      code: "NO_TOKEN",
    });
  }
};

// Enhanced middleware for role-based authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user exists (should be set by protect middleware)
    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated - please login first",
        code: "NOT_AUTHENTICATED",
      });
    }

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role(s): ${roles.join(
          ", "
        )}. Your role: ${req.user.role}`,
        code: "INSUFFICIENT_PERMISSIONS",
        userRole: req.user.role,
        requiredRoles: roles,
      });
    }

    // User has valid role, proceed
    next();
  };
};

// Optional: Middleware to check if user owns resource (for user-specific data)
export const authorizeOwner = (userIdField = "userId") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated",
        code: "NOT_AUTHENTICATED",
      });
    }

    // Get user ID from request params, query, or body
    const resourceUserId =
      req.params[userIdField] ||
      req.query[userIdField] ||
      req.body[userIdField];

    // Admin can access any resource
    if (req.user.role === "admin") {
      return next();
    }

    // Check if user owns the resource
    if (
      req.user.id !== parseInt(resourceUserId) &&
      req.user.id !== resourceUserId
    ) {
      return res.status(403).json({
        message: "Access denied - you can only access your own resources",
        code: "RESOURCE_ACCESS_DENIED",
      });
    }

    next();
  };
};

// Optional: Middleware for admin-only routes (shorthand)
export const adminOnly = authorize("admin");

// Optional: Middleware for multiple specific roles (common combinations)
export const farmerOrAdmin = authorize("farmer", "admin");
export const manufacturerOrAdmin = authorize("manufacturer", "admin");
export const labOrAdmin = authorize("lab", "admin");

// Optional: Middleware to attach user profile based on role
export const attachProfile = async (req, res, next) => {
  if (!req.user) {
    return next();
  }

  try {
    let profile = null;

    switch (req.user.role) {
      case "farmer":
        profile = await prisma.farmerProfile.findUnique({
          where: { userId: req.user.id },
        });
        break;
      case "manufacturer":
        profile = await prisma.manufacturerProfile.findUnique({
          where: { userId: req.user.id },
        });
        break;
      case "lab":
        profile = await prisma.laboratoryProfile.findUnique({
          where: { userId: req.user.id },
        });
        break;
      case "admin":
        profile = await prisma.adminProfile.findUnique({
          where: { userId: req.user.id },
        });
        break;
    }

    req.userProfile = profile;
    next();
  } catch (error) {
    console.error("Error attaching profile:", error);
    // Continue without profile if there's an error
    next();
  }
};

export const requireAnyRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. One of these roles required: ${allowedRoles.join(
          ", "
        )}`,
        userRole: req.user.role,
        allowedRoles,
      });
    }

    next();
  };
};

// Cleanup function to close Prisma connection (call this when shutting down)
export const cleanup = async () => {
  await prisma.$disconnect();
};

// Export the authenticateToken alias for backward compatibility
export const authenticateToken = protect;
// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Middleware to protect routes (checks for a valid token)
export const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, fullName: true, role: true },
      });

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Middleware for role-based authorization (THE FIX IS HERE)
export const authorize = (...roles) => {
  return (req, res, next) => {
    // This 'if' block is the crucial part.
    // If the user's role is not in the allowed 'roles' array, it sends a 403 and stops.
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({
          message: `User role '${req.user.role}' is not authorized to access this route.`,
        });
    }
    // This 'next()' is only called if the user's role IS valid.
    next();
  };
};

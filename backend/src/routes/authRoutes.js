// File: routes/authRoutes.js

import express from "express";
import { register, login, getProfile, logout } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import upload from "../middleware/multerMiddleware.js";
// ... other imports

const router = express.Router();

// Public routes
router.post(
  "/register",
  // Key Fix: Change the field name to 'file' to match the frontend FormData
  upload.single("file"),
  register
);

router.post("/login", login);

// Protected routes
router.get("/profile", authenticateToken, getProfile);
router.post("/logout", authenticateToken, logout);

export default router;
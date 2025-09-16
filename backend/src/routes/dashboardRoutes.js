// routes/dashboardRoutes.js (Updated)
import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin Route (existing)
router.get("/admin", protect, authorize("ADMIN"), (req, res) => {
  res.json({
    message: `Welcome Admin ${req.user.fullName}!`,
    data: "This is your secret admin dashboard data.",
  });
});

// FPO Route (existing)
router.get("/fpo", protect, authorize("FPO"), (req, res) => {
  res.json({
    message: `Welcome FPO member ${req.user.fullName}!`,
    data: "Here is your FPO-specific information.",
  });
});

// --- Add these new routes ---

// Manufacturer Route (new)
router.get("/manufacturer", protect, authorize("MANUFACTURER"), (req, res) => {
  res.json({
    message: `Welcome Manufacturer ${req.user.fullName}!`,
    data: "Here is your manufacturer dashboard content.",
  });
});

// Laboratory Route (new)
router.get("/laboratory", protect, authorize("LABORATORY"), (req, res) => {
  res.json({
    message: `Welcome Laboratory staff ${req.user.fullName}!`,
    data: "Access to laboratory testing panels granted.",
  });
});

export default router;

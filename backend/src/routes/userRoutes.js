// src/routes/userRoutes.js
import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// @desc    Get current user's profile
// @route   GET /api/user/me
// @access  Private
router.get("/me", protect, (req, res) => {
  // The 'protect' middleware runs first. If the token is valid,
  // it attaches the user's data to the request object as 'req.user'.
  res.status(200).json(req.user);
});

export default router;

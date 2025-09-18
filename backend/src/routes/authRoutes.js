import express from "express";
import { register, login, getProfile, logout } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import upload from "../middleware/multerMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import {
  registerSchema,
  loginSchema,
  checkEmailSchema,
} from "../utils/validationSchemas.js";

const router = express.Router();

// Public routes
router.post(
  "/register",
  upload.single("idProofUrl"),
  // validate(registerSchema),
  register
);

router.post("/login", login);

// Protected routes (require authentication)
router.get("/profile", authenticateToken, getProfile);
router.post("/logout", authenticateToken, logout);

export default router;

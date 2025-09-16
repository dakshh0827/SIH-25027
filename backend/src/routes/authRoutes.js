// src/routes/authRoutes.js
import { Router } from "express";
import {
  registerStep1,
  registerAdmin,
  registerStep3,
  registerCommon,
  loginUser,
} from "../controllers/authController.js";
import { verifyStepToken } from "../middleware/authMiddleware.js";
import { upload } from "../config/upload.js"; // Import the upload middleware

const router = Router();

// --- REGISTRATION ROUTES ---
router.post("/register/step1", registerStep1);

// This route now expects one file with the field name 'idProof'
router.post(
  "/register/admin",
  verifyStepToken,
  upload.single("idProof"),
  registerAdmin
);

// This route now expects one file with either 'registrationCertificate' or 'representativeIdProof'
router.post(
  "/register/step3",
  verifyStepToken,
  upload.single("document"),
  registerStep3
);

router.post("/register/common", verifyStepToken, registerCommon);

// --- LOGIN ROUTE ---
router.post("/login", loginUser);

export default router;

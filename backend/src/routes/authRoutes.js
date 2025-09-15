// src/routes/authRoutes.js
import { Router } from "express";
import {
  registerStep1,
  registerAdmin,
  registerStep3,
  registerCommon,
} from "../controllers/authController.js";
import { verifyStepToken } from "../middleware/authMiddleware.js";

const router = Router();

// Step 1 doesn't need a token
router.post("/register/step1", registerStep1);

// The subsequent steps require the token from the previous step
router.post("/register/admin", verifyStepToken, registerAdmin);
router.post("/register/step3", verifyStepToken, registerStep3);
router.post("/register/common", verifyStepToken, registerCommon);

export default router;

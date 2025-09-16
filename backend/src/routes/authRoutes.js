// routes/authRoutes.js
import express from "express";
import { register, login } from "../controllers/authController.js";
import upload from "../middleware/multerMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js"; // Import validate middleware
import { registerSchema, loginSchema } from "../utils/validationSchemas.js"; // Import schemas

const router = express.Router();

// Add the validation middleware before the upload and register controller
// CORRECT ORDER
router.post(
  "/register",
  upload.single("idProofUrl"),
  validate(registerSchema),
  register
);

// Add validation to the login route as well
router.post("/login", validate(loginSchema), login);

export default router;

// routes/authRoutes.js
import express from "express";
import { register, login } from "../controllers/authController.js";
import upload from "../middleware/multerMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js"; // Import validate middleware
import {
  registerSchema,
  loginSchema,
  checkEmailSchema,
} from "../utils/validationSchemas.js"; // Import schemas

const router = express.Router();

router.post(
  "/register",
  upload.single("idProofUrl"),
  // validate(registerSchema),
  register
);

router.post("/check-email", validate(checkEmailSchema), async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    res.status(200).json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add validation to the login route as well
router.post("/login", login);

export default router;

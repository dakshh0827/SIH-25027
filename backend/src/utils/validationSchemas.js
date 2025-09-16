// src/utils/validationSchemas.js
import { z } from "zod";

export const verifyOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  type: z.string().optional(), // e.g., 'email_verification'
});

export const resendOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
  type: z.string().optional(),
});

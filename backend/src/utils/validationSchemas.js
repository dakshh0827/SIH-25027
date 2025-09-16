// utils/validationSchemas.js
import { z } from "zod";

// Base schema for common fields (fullName, email, password)
const baseUserSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters long."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
});

// Schema for Admin registration
const adminSchema = baseUserSchema.extend({
  role: z.literal("ADMIN"),
  adminId: z.string().min(1, "Admin ID is required."),
  metamaskAddress: z
    .string()
    .startsWith("0x", "Must be a valid Ethereum address.")
    .length(42, "Must be a valid Ethereum address."),
});

// Schema for FPO registration
const fpoSchema = baseUserSchema.extend({
  role: z.literal("FPO"),
  fpoName: z.string().min(1, "FPO Name is required."),
  registrationNumber: z.string().min(1, "Registration number is required."),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format."),
  gstin: z
    .string()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "Invalid GSTIN format."
    ),
  registeredAddress: z.string().min(10, "Registered address is too short."),
  authorizedRepresentative: z
    .string()
    .min(3, "Authorized representative name is required."),
});

// Schema for Manufacturer registration
const manufacturerSchema = baseUserSchema.extend({
  role: z.literal("MANUFACTURER"),
  manufacturerName: z.string().min(1, "Manufacturer name is required."),
  ayushLicenseNumber: z.string().min(1, "AYUSH License number is required."),
  registrationNumber: z.string().min(1, "Registration number is required."),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format."),
  gstin: z
    .string()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "Invalid GSTIN format."
    ),
  registeredAddress: z.string().min(10, "Registered address is too short."),
  authorizedRepresentative: z
    .string()
    .min(3, "Authorized representative name is required."),
});

// Schema for Laboratory registration
const laboratorySchema = baseUserSchema.extend({
  role: z.literal("LABORATORY"),
  labName: z.string().min(1, "Lab name is required."),
  nablAccreditationNumber: z
    .string()
    .min(1, "NABL Accreditation number is required."),
  scopeOfNablAccreditation: z.string().min(1, "Scope of NABL is required."),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format."),
  gstin: z
    .string()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "Invalid GSTIN format."
    ),
  registeredAddress: z.string().min(10, "Registered address is too short."),
  authorizedRepresentative: z
    .string()
    .min(3, "Authorized representative name is required."),
});

// The main registration schema that uses discriminatedUnion
export const registerSchema = z.discriminatedUnion("role", [
  adminSchema,
  fpoSchema,
  manufacturerSchema,
  laboratorySchema,
]);

// Simple schema for login
export const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password cannot be empty."),
});

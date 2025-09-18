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
  role: z.literal("admin"),
  adminId: z.string().min(1, "Admin ID is required."),
  metamaskAddress: z
    .string()
    .startsWith("0x", "Must be a valid Ethereum address.")
    .length(42, "Must be a valid Ethereum address."),
});

// Schema for FPO registration
const fpoSchema = baseUserSchema.extend({
  role: z.literal("farmer"),
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
  role: z.literal("manufacturer"),
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
  role: z.literal("lab"),
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

export const harvestSchema = z.object({
  herbSpecies: z.string().min(1, "Herb species is required."),
  harvestWeightKg: z
    .string()
    .transform(Number)
    .refine((n) => n > 0, "Harvest weight must be a positive number."),
  harvestSeason: z.string().min(1, "Harvest season is required."),
  location: z.string().min(1, "Location is required."),
  notes: z.string().optional(),
  // For form-data, tags might come as a single string or multiple. We handle both.
  regulatoryTags: z.union([z.string(), z.array(z.string())]).optional(),
});

// Schema for creating a new Manufacturing Report
export const manufacturingReportSchema = z.object({
  batchId: z.string().min(1, "Batch ID is required."),
  herbUsed: z.string().min(1, "Herb used is required."),
  quantityUsedKg: z
    .string()
    .transform(Number)
    .refine((n) => n > 0, "Quantity used must be a positive number."),
  processingSteps: z
    .string()
    .min(10, "Processing steps must be at least 10 characters long."),
  expiryDate: z.string().datetime().optional().nullable(), // expecting ISO date string e.g. "2025-12-31T00:00:00.000Z"
  notes: z.string().optional(),
  regulatoryTags: z.union([z.string(), z.array(z.string())]).optional(),
});

// Schema for creating a new Lab Report
export const labReportSchema = z.object({
  batchId: z.string().min(1, "Batch ID of the product to test is required."),
  testType: z.string().min(1, "Test type is required."),
  testResult: z.string().min(1, "Test result is required."),
  notes: z.string().optional(),
  regulatoryTags: z.union([z.string(), z.array(z.string())]).optional(),
});

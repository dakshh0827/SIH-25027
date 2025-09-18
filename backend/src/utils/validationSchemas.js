import { z } from "zod";

// Updated Lab Report Schema to match your new schema design
export const manufacturingReportSchema = z.object({
  // These fields will be auto-generated on backend, so make them optional
  batchId: z.string().optional(),
  identifier: z.string().optional(),
  
  // Required fields from your request
  herbUsed: z.string().min(1, "Herb used is required."),
  quantityUsedKg: z
    .union([z.string(), z.number()])
    .transform((val) => typeof val === 'string' ? parseFloat(val) : val)
    .refine((n) => !isNaN(n) && n > 0, "Quantity used must be a positive number."),
  processingSteps: z
    .string()
    .min(1, "Processing steps are required."), // Reduced from 10 to 1 since your test data is short
  
  // Status field from your request
  status: z.enum(["in-progress", "completed", "quality-check", "approved"]).default("in-progress"),
  
  // Date fields - these should match your Prisma model
  effectiveDate: z.string().min(1, "Manufacturing date is required."),
  expiryDate: z.string().optional(),
  
  // Optional fields
  notes: z.string().optional(),
  regulatoryTags: z.union([z.string(), z.array(z.string())]).optional(),
});

// Rest of your schemas remain the same...
export const labReportSchema = z.object({
  manufacturingReportId: z.string().min(1, "Manufacturing Report ID is required."),
  testType: z.string().min(1, "Test type is required."),
  testResult: z.string().min(1, "Test result is required."),
  status: z.enum(["registered", "preliminary", "final", "amended"]).default("final"),
  effectiveDate: z.string().min(1, "Test performed date is required."),
  issuedDate: z.string().min(1, "Report issued date is required."),
  notes: z.string().optional(),
  regulatoryTags: z.union([z.string(), z.array(z.string())]).optional(),
});

// Rest of your existing schemas remain the same...
export const checkEmailSchema = z.object({
  email: z.string().email("Invalid email address."),
});

const baseUserSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters long."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
});

const adminSchema = baseUserSchema.extend({
  role: z.literal("admin"),
  adminId: z.string().min(1, "Admin ID is required."),
  metamaskAddress: z
    .string()
    .startsWith("0x", "Must be a valid Ethereum address.")
    .length(42, "Must be a valid Ethereum address."),
});

const fpoSchema = baseUserSchema.extend({
  role: z.literal("farmer"),
  fpoName: z.string().min(1, "FPO Name is required."),
  regNumber: z.string().min(1, "Registration number is required."),
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

export const registerSchema = z.discriminatedUnion("role", [
  adminSchema,
  fpoSchema,
  manufacturerSchema,
  laboratorySchema,
]);

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
  regulatoryTags: z.union([z.string(), z.array(z.string())]).optional(),
});
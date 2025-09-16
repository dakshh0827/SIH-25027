import React, { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, Tractor, Factory, TestTubeDiagonal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Zod schema for FPO details
const fpoSchema = z.object({
  fpoName: z.string().min(1, "FPO Name is required."),
  regNumber: z.string().min(1, "Registration Number is required."),
  pan: z.string().regex(/^[A-Z]{5}\d{4}[A-Z]{1}$/, "Invalid PAN format."),
  gstin: z.string().regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/, "Invalid GSTIN format."),
  registeredAddress: z.string().min(1, "Registered Address is required."),
  authorizedRepresentative: z.string().min(1, "Authorized Representative is required."),
});

// Zod schema for Manufacturer details
const manufacturerSchema = z.object({
  manufacturerName: z.string().min(1, "Manufacturer Name is required."),
  ayushLicenseNumber: z.string().min(1, "AYUSH License Number is required."),
  regNumber: z.string().min(1, "Registration Number is required."),
  pan: z.string().regex(/^[A-Z]{5}\d{4}[A-Z]{1}$/, "Invalid PAN format."),
  gstin: z.string().regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/, "Invalid GSTIN format."),
  registeredAddress: z.string().min(1, "Registered Address is required."),
  authorizedRepresentative: z.string().min(1, "Authorized Representative is required."),
});

// Zod schema for Laboratory details
const labSchema = z.object({
  labName: z.string().min(1, "Lab Name is required."),
  nablAccreditationNumber: z.string().min(1, "NABL Accreditation Number is required."),
  scopeOfNablAccreditation: z.string().min(1, "Scope of NABL Accreditation is required."),
  pan: z.string().regex(/^[A-Z]{5}\d{4}[A-Z]{1}$/, "Invalid PAN format."),
  gstin: z.string().regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/, "Invalid GSTIN format."),
  registeredAddress: z.string().min(1, "Registered Address is required."),
  authorizedRepresentative: z.string().min(1, "Authorized Representative is required."),
});

const OrganizationDetailsStep = ({
  formData,
  onNext,
  onBack,
}) => {
  const [orgType, setOrgType] = useState(formData.organizationType || "fpo");

  const schemaMap = {
    fpo: fpoSchema,
    manufacturers: manufacturerSchema,
    laboratories: labSchema,
  };

  const currentSchema = schemaMap[orgType];

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(currentSchema),
  });

  useEffect(() => {
    reset();
  }, [orgType, reset]);

  const onSubmit = (data) => {
    onNext({ ...formData, ...data, organizationType: orgType });
  };

  const renderForm = () => {
    switch (orgType) {
      case "fpo":
        return (
          <div className="space-y-4">
            {/* FPO Name */}
            <div>
              <label htmlFor="fpoName" className="block text-sm font-medium text-slate-300">
                FPO Name
              </label>
              <input
                type="text"
                id="fpoName"
                {...register("fpoName")}
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
              />
              {errors.fpoName && <p className="mt-1 text-sm text-red-400">{errors.fpoName.message}</p>}
            </div>
            {/* Registration Number */}
            <div>
              <label htmlFor="regNumber" className="block text-sm font-medium text-slate-300">
                Registration Number
              </label>
              <input
                type="text"
                id="regNumber"
                {...register("regNumber")}
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
              />
              {errors.regNumber && <p className="mt-1 text-sm text-red-400">{errors.regNumber.message}</p>}
            </div>
            {/* PAN */}
            <div>
              <label htmlFor="pan" className="block text-sm font-medium text-slate-300">
                PAN
              </label>
              <input
                type="text"
                id="pan"
                {...register("pan")}
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
              />
              {errors.pan && <p className="mt-1 text-sm text-red-400">{errors.pan.message}</p>}
            </div>
            {/* GSTIN */}
            <div>
              <label htmlFor="gstin" className="block text-sm font-medium text-slate-300">
                GSTIN
              </label>
              <input
                type="text"
                id="gstin"
                {...register("gstin")}
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
              />
              {errors.gstin && <p className="mt-1 text-sm text-red-400">{errors.gstin.message}</p>}
            </div>
            {/* Registered Address */}
            <div>
              <label htmlFor="registeredAddress" className="block text-sm font-medium text-slate-300">
                Registered Address
              </label>
              <input
                type="text"
                id="registeredAddress"
                {...register("registeredAddress")}
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
              />
              {errors.registeredAddress && <p className="mt-1 text-sm text-red-400">{errors.registeredAddress.message}</p>}
            </div>
            {/* Authorized Representative */}
            <div>
              <label htmlFor="authorizedRepresentative" className="block text-sm font-medium text-slate-300">
                Authorized Representative
              </label>
              <input
                type="text"
                id="authorizedRepresentative"
                {...register("authorizedRepresentative")}
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
              />
              {errors.authorizedRepresentative && <p className="mt-1 text-sm text-red-400">{errors.authorizedRepresentative.message}</p>}
            </div>
          </div>
        );
      case "manufacturers":
        return (
          <div className="space-y-4">
            {/* Manufacturer Name */}
            <div>
              <label htmlFor="manufacturerName" className="block text-sm font-medium text-slate-300">
                Manufacturer Name
              </label>
              <input
                type="text"
                id="manufacturerName"
                {...register("manufacturerName")}
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
              />
              {errors.manufacturerName && <p className="mt-1 text-sm text-red-400">{errors.manufacturerName.message}</p>}
            </div>
            {/* AYUSH License Number */}
            <div>
              <label htmlFor="ayushLicenseNumber" className="block text-sm font-medium text-slate-300">
                AYUSH License Number
              </label>
              <input
                type="text"
                id="ayushLicenseNumber"
                {...register("ayushLicenseNumber")}
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
              />
              {errors.ayushLicenseNumber && <p className="mt-1 text-sm text-red-400">{errors.ayushLicenseNumber.message}</p>}
            </div>
            {/* Registration Number */}
            <div>
              <label htmlFor="regNumber" className="block text-sm font-medium text-slate-300">
                Registration Number
              </label>
              <input
                type="text"
                id="regNumber"
                {...register("regNumber")}
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
              />
              {errors.regNumber && <p className="mt-1 text-sm text-red-400">{errors.regNumber.message}</p>}
            </div>
            {/* PAN */}
            <div>
              <label htmlFor="pan" className="block text-sm font-medium text-slate-300">
                PAN
              </label>
              <input
                type="text"
                id="pan"
                {...register("pan")}
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
              />
              {errors.pan && <p className="mt-1 text-sm text-red-400">{errors.pan.message}</p>}
            </div>
            {/* GSTIN */}
            <div>
              <label htmlFor="gstin" className="block text-sm font-medium text-slate-300">
                GSTIN
              </label>
              <input
                type="text"
                id="gstin"
                {...register("gstin")}
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
              />
              {errors.gstin && <p className="mt-1 text-sm text-red-400">{errors.gstin.message}</p>}
            </div>
            {/* Registered Address */}
            <div>
              <label htmlFor="registeredAddress" className="block text-sm font-medium text-slate-300">
                Registered Address
              </label>
              <input
                type="text"
                id="registeredAddress"
                {...register("registeredAddress")}
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
              />
              {errors.registeredAddress && <p className="mt-1 text-sm text-red-400">{errors.registeredAddress.message}</p>}
            </div>
            {/* Authorized Representative */}
            <div>
              <label htmlFor="authorizedRepresentative" className="block text-sm font-medium text-slate-300">
                Authorized Representative
              </label>
              <input
                type="text"
                id="authorizedRepresentative"
                {...register("authorizedRepresentative")}
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
              />
              {errors.authorizedRepresentative && <p className="mt-1 text-sm text-red-400">{errors.authorizedRepresentative.message}</p>}
            </div>
          </div>
        );
      case "laboratories":
        return (
          <div className="space-y-4">
            {/* Lab Name */}
            <div>
              <label htmlFor="labName" className="block text-sm font-medium text-slate-300">
                Lab Name
              </label>
              <input
                type="text"
                id="labName"
                {...register("labName")}
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
              />
              {errors.labName && <p className="mt-1 text-sm text-red-400">{errors.labName.message}</p>}
            </div>
            {/* NABL Accreditation Number */}
            <div>
              <label htmlFor="nablAccreditationNumber" className="block text-sm font-medium text-slate-300">
                NABL Accreditation Number
              </label>
              <input
                type="text"
                id="nablAccreditationNumber"
                {...register("nablAccreditationNumber")}
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
              />
              {errors.nablAccreditationNumber && <p className="mt-1 text-sm text-red-400">{errors.nablAccreditationNumber.message}</p>}
            </div>
            {/* Scope of NABL Accreditation */}
            <div>
              <label htmlFor="scopeOfNablAccreditation" className="block text-sm font-medium text-slate-300">
                Scope of NABL Accreditation
              </label>
              <input
                type="text"
                id="scopeOfNablAccreditation"
                {...register("scopeOfNablAccreditation")}
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
              />
              {errors.scopeOfNablAccreditation && <p className="mt-1 text-sm text-red-400">{errors.scopeOfNablAccreditation.message}</p>}
            </div>
            {/* PAN */}
            <div>
              <label htmlFor="pan" className="block text-sm font-medium text-slate-300">
                PAN
              </label>
              <input
                type="text"
                id="pan"
                {...register("pan")}
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
              />
              {errors.pan && <p className="mt-1 text-sm text-red-400">{errors.pan.message}</p>}
            </div>
            {/* GSTIN */}
            <div>
              <label htmlFor="gstin" className="block text-sm font-medium text-slate-300">
                GSTIN
              </label>
              <input
                type="text"
                id="gstin"
                {...register("gstin")}
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
              />
              {errors.gstin && <p className="mt-1 text-sm text-red-400">{errors.gstin.message}</p>}
            </div>
            {/* Registered Address */}
            <div>
              <label htmlFor="registeredAddress" className="block text-sm font-medium text-slate-300">
                Registered Address
              </label>
              <input
                type="text"
                id="registeredAddress"
                {...register("registeredAddress")}
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
              />
              {errors.registeredAddress && <p className="mt-1 text-sm text-red-400">{errors.registeredAddress.message}</p>}
            </div>
            {/* Authorized Representative */}
            <div>
              <label htmlFor="authorizedRepresentative" className="block text-sm font-medium text-slate-300">
                Authorized Representative
              </label>
              <input
                type="text"
                id="authorizedRepresentative"
                {...register("authorizedRepresentative")}
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
              />
              {errors.authorizedRepresentative && <p className="mt-1 text-sm text-red-400">{errors.authorizedRepresentative.message}</p>}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl text-white font-semibold">
        Step 3: Organization Details
      </h3>
      <p className="text-slate-400">
        Provide the following details for verification as a community
        organization.
      </p>

      {/* Sliding Toggle Bar */}
      <div className="relative flex w-full h-20 bg-slate-700/50 border border-slate-600">
        <motion.div
          className="absolute h-full w-1/3 bg-green-600/30 border border-green-500"
          initial={false}
          animate={{ 
            x: orgType === "fpo" ? "0%" : orgType === "manufacturers" ? "100%" : "200%" 
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        <button
          type="button"
          onClick={() => setOrgType("fpo")}
          className={`relative z-10 w-1/3 flex flex-col items-center justify-center transition-all duration-300 ${
            orgType === "fpo" ? "text-white" : "text-slate-300 hover:text-white"
          }`}
        >
          <Tractor className="h-8 w-8 mb-1" />
          <span className="font-medium">FPO</span>
        </button>
        <button
          type="button"
          onClick={() => setOrgType("manufacturers")}
          className={`relative z-10 w-1/3 flex flex-col items-center justify-center transition-all duration-300 ${
            orgType === "manufacturers" ? "text-white" : "text-slate-300 hover:text-white"
          }`}
        >
          <Factory className="h-8 w-8 mb-1" />
          <span className="font-medium">Manufacturer</span>
        </button>
        <button
          type="button"
          onClick={() => setOrgType("laboratories")}
          className={`relative z-10 w-1/3 flex flex-col items-center justify-center transition-all duration-300 ${
            orgType === "laboratories" ? "text-white" : "text-slate-300 hover:text-white"
          }`}
        >
          <TestTubeDiagonal className="h-8 w-8 mb-1" />
          <span className="font-medium">Laboratory</span>
        </button>
      </div>

      {/* Animated Form Section */}
      <AnimatePresence mode="wait">
        <motion.form
          key={orgType}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {renderForm()}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 flex items-center justify-center px-4 py-3 border border-slate-600 text-slate-300 font-semibold transition-all duration-300 hover:bg-slate-600 hover:text-white active:scale-[0.98]"
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Back
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center px-4 py-3 border border-slate-600 text-slate-300 font-semibold transition-all duration-300 hover:bg-slate-600 hover:text-white active:scale-[0.98]"
            >
              Complete Signup <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </motion.form>
      </AnimatePresence>
    </div>
  );
};

export default OrganizationDetailsStep;
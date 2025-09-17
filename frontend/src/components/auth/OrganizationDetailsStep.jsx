import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, ChevronLeft, Tractor, Factory, TestTubeDiagonal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from 'react-hot-toast';

// Zod schema for Farmer details
const farmerSchema = z.object({
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
  const [orgType, setOrgType] = useState(formData.organizationType || "farmer");
  const schemaMap = {
    farmer: farmerSchema,
    manufacturer: manufacturerSchema,
    lab: labSchema,
  };
  
  const currentSchema = schemaMap[orgType];
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(currentSchema),
  });

  useEffect(() => {
    reset();
  }, [orgType, reset]);

  // Show validation error toasts
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0]?.message;
      if (firstError) {
        toast.error(firstError, {
          duration: 3000,
        });
      }
    }
  }, [errors]);

  const handleOrgTypeChange = (type) => {
    const typeNames = {
      'farmer': 'Farmer/FPO',
      'manufacturer': 'Manufacturer',
      'lab': 'Laboratory'
    };
    
    setOrgType(type);
    toast.success(`Switched to ${typeNames[type]} form`, {
      duration: 2000,
    });
  };

  const onSubmit = (data) => {
    // Create a loading toast
    const loadingToast = toast.loading('Completing your signup...', {
      position: 'top-right',
    });

    try {
      // Simulate form processing delay
      setTimeout(() => {
        const orgNames = {
          'farmer': 'Farmer/FPO',
          'manufacturer': 'Manufacturer', 
          'lab': 'Laboratory'
        };

        toast.dismiss(loadingToast);
        toast.success(`${orgNames[orgType]} registration completed successfully!`, {
          duration: 4000,
          position: 'top-right',
        });
        
        // This is the key change: we now set the 'role' based on the submitted form type
        onNext({ ...formData, ...data, role: orgType });
      }, 1500);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Registration failed. Please try again.', {
        duration: 4000,
        position: 'top-right',
      });
    }
  };

  const handleBack = () => {
    toast.loading('Going back to previous step...', {
      duration: 1000,
    });
    setTimeout(() => {
      onBack();
    }, 500);
  };

  const renderForm = () => {
    switch (orgType) {
      case "farmer":
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
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
                onFocus={() => toast.dismiss()}
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
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
                onFocus={() => toast.dismiss()}
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
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
                onFocus={() => toast.dismiss()}
                placeholder="e.g., ABCDE1234F"
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
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
                onFocus={() => toast.dismiss()}
                placeholder="e.g., 22ABCDE1234F1Z5"
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
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
                onFocus={() => toast.dismiss()}
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
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
                onFocus={() => toast.dismiss()}
              />
              {errors.authorizedRepresentative && <p className="mt-1 text-sm text-red-400">{errors.authorizedRepresentative.message}</p>}
            </div>
          </div>
        );
      case "manufacturer":
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
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
                onFocus={() => toast.dismiss()}
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
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
                onFocus={() => toast.dismiss()}
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
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
                onFocus={() => toast.dismiss()}
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
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
                onFocus={() => toast.dismiss()}
                placeholder="e.g., ABCDE1234F"
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
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
                onFocus={() => toast.dismiss()}
                placeholder="e.g., 22ABCDE1234F1Z5"
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
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
                onFocus={() => toast.dismiss()}
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
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
                onFocus={() => toast.dismiss()}
              />
              {errors.authorizedRepresentative && <p className="mt-1 text-sm text-red-400">{errors.authorizedRepresentative.message}</p>}
            </div>
          </div>
        );
      case "lab":
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
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
                onFocus={() => toast.dismiss()}
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
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
                onFocus={() => toast.dismiss()}
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
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
                onFocus={() => toast.dismiss()}
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
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
                onFocus={() => toast.dismiss()}
                placeholder="e.g., ABCDE1234F"
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
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
                onFocus={() => toast.dismiss()}
                placeholder="e.g., 22ABCDE1234F1Z5"
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
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
                onFocus={() => toast.dismiss()}
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
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
                onFocus={() => toast.dismiss()}
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
            x: orgType === "farmer" ? "0%" : orgType === "manufacturer" ? "100%" : "200%"
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        <button
          type="button"
          onClick={() => handleOrgTypeChange("farmer")}
          className={`relative z-10 w-1/3 flex flex-col items-center justify-center transition-all duration-300 ${
            orgType === "farmer" ? "text-white" : "text-slate-300 hover:text-white"
          }`}
        >
          <Tractor className="h-8 w-8 mb-1" />
          <span className="font-medium">Farmer</span>
        </button>
        <button
          type="button"
          onClick={() => handleOrgTypeChange("manufacturer")}
          className={`relative z-10 w-1/3 flex flex-col items-center justify-center transition-all duration-300 ${
            orgType === "manufacturer" ? "text-white" : "text-slate-300 hover:text-white"
          }`}
        >
          <Factory className="h-8 w-8 mb-1" />
          <span className="font-medium">Manufacturer</span>
        </button>
        <button
          type="button"
          onClick={() => handleOrgTypeChange("lab")}
          className={`relative z-10 w-1/3 flex flex-col items-center justify-center transition-all duration-300 ${
            orgType === "lab" ? "text-white" : "text-slate-300 hover:text-white"
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
              onClick={handleBack}
              className="flex-1 flex items-center justify-center px-4 py-3 border border-[#34d399] bg-transparent text-[#34d399] font-semibold transition-all duration-300 hover:bg-[#10b981] hover:border-[#10b981] hover:text-white active:scale-[0.98]"
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Back
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center px-4 py-3 border border-[#10b981] bg-[#10b981] text-white font-semibold transition-all duration-300 hover:bg-transparent hover:border-[#34d399] hover:text-[#34d399] active:scale-[0.98]"
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

import React, { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, Building, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Zod schema for NGO details
const ngoSchema = z.object({
  ngoLegalName: z.string().min(1, "Legal Name is required."),
  regId: z.string().min(1, "Registration Number is required."),
  regType: z.string().min(1, "Registration Type is required."),
  regCertificate: z.any().refine((fileList) => fileList?.length > 0, "Registration Certificate is required."),
  panNumber: z.string().regex(/^[A-Z]{5}\d{4}[A-Z]{1}$/, "Invalid PAN format."),
  yearOfEstablishment: z.string().refine(
    (val) => !isNaN(parseInt(val)) && parseInt(val) <= new Date().getFullYear(),
    "Invalid year."
  ),
});

// Zod schema for Panchayat details
const panchayatSchema = z.object({
  panchayatCode: z.string().min(1, "Panchayat Code is required."),
  panchayatName: z.string().min(1, "Panchayat Name is required."),
  sarpanchName: z.string().min(1, "Sarpanch Name is required."),
  repIdProof: z.any().refine((fileList) => fileList?.length > 0, "ID Proof is required."),
  officialLetter: z.any().refine((fileList) => fileList?.length > 0, "Official Letter is required."),
  panchayatSeal: z.any().refine((fileList) => fileList?.length > 0, "Panchayat Seal is required."),
});

const OrganizationDetailsStep = ({
  formData,
  handleChange,
  onNext,
  onBack,
}) => {
  const [orgType, setOrgType] = useState(formData.organizationType || "ngo");
  
  const currentSchema = orgType === "ngo" ? ngoSchema : panchayatSchema;

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(currentSchema),
  });

  // Reset form state when orgType changes
  useEffect(() => {
    reset();
  }, [orgType, reset]);

  const onSubmit = (data) => {
    // Merge data from the current form with the parent form data
    onNext({ ...formData, ...data, organizationType: orgType });
  };

  const handleOrgTypeChange = (type) => {
    setOrgType(type);
    handleChange({
        target: { name: 'organizationType', value: type }
    });
  };

  const renderNgoForm = () => (
    <div className="space-y-4">
      {/* NGO Legal Name */}
      <div>
        <label htmlFor="ngoLegalName" className="block text-sm font-medium text-slate-300">
          NGO Legal Name
        </label>
        <input
          type="text"
          id="ngoLegalName"
          {...register("ngoLegalName")}
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
        />
        {errors.ngoLegalName && <p className="mt-1 text-sm text-red-400">{errors.ngoLegalName.message}</p>}
      </div>

      {/* Registration Number */}
      <div>
        <label htmlFor="regId" className="block text-sm font-medium text-slate-300">
          Registration Number
        </label>
        <input
          type="text"
          id="regId"
          {...register("regId")}
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
        />
        {errors.regId && <p className="mt-1 text-sm text-red-400">{errors.regId.message}</p>}
      </div>

      {/* Registration Type */}
      <div>
        <label htmlFor="regType" className="block text-sm font-medium text-slate-300">
          Registration Type
        </label>
        <input
          type="text"
          id="regType"
          {...register("regType")}
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
        />
        {errors.regType && <p className="mt-1 text-sm text-red-400">{errors.regType.message}</p>}
      </div>

      {/* Registration Certificate Upload */}
      <div>
        <label htmlFor="regCertificate" className="block text-sm font-medium text-slate-300">
          Registration Certificate Upload
        </label>
        <input
          type="file"
          id="regCertificate"
          {...register("regCertificate")}
          className="mt-1 block w-full text-sm text-slate-500 
            file:mr-4 file:py-2 file:px-4 file:border-0 
            file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
        />
        {errors.regCertificate && <p className="mt-1 text-sm text-red-400">{errors.regCertificate.message}</p>}
      </div>
      
      {/* PAN Number (Organization) */}
      <div>
        <label htmlFor="panNumber" className="block text-sm font-medium text-slate-300">
          PAN Number (Organization)
        </label>
        <input
          type="text"
          id="panNumber"
          {...register("panNumber")}
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
        />
        {errors.panNumber && <p className="mt-1 text-sm text-red-400">{errors.panNumber.message}</p>}
      </div>
      
      {/* Year of Establishment */}
      <div>
        <label htmlFor="yearOfEstablishment" className="block text-sm font-medium text-slate-300">
          Year of Establishment
        </label>
        <input
          type="number"
          id="yearOfEstablishment"
          {...register("yearOfEstablishment")}
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
        />
        {errors.yearOfEstablishment && <p className="mt-1 text-sm text-red-400">{errors.yearOfEstablishment.message}</p>}
      </div>
    </div>
  );

  const renderPanchayatForm = () => (
    <div className="space-y-4">
      {/* Panchayat Code */}
      <div>
        <label htmlFor="panchayatCode" className="block text-sm font-medium text-slate-300">
          Panchayat Code
        </label>
        <input
          type="text"
          id="panchayatCode"
          {...register("panchayatCode")}
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
        />
        {errors.panchayatCode && <p className="mt-1 text-sm text-red-400">{errors.panchayatCode.message}</p>}
      </div>

      {/* Panchayat Name */}
      <div>
        <label htmlFor="panchayatName" className="block text-sm font-medium text-slate-300">
          Panchayat Name
        </label>
        <input
          type="text"
          id="panchayatName"
          {...register("panchayatName")}
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
        />
        {errors.panchayatName && <p className="mt-1 text-sm text-red-400">{errors.panchayatName.message}</p>}
      </div>

      {/* Sarpanch / Authorized Representative Name */}
      <div>
        <label htmlFor="sarpanchName" className="block text-sm font-medium text-slate-300">
          Sarpanch / Authorized Representative Name
        </label>
        <input
          type="text"
          id="sarpanchName"
          {...register("sarpanchName")}
          className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
        />
        {errors.sarpanchName && <p className="mt-1 text-sm text-red-400">{errors.sarpanchName.message}</p>}
      </div>

      {/* Authorized Representative ID Proof */}
      <div>
        <label htmlFor="repIdProof" className="block text-sm font-medium text-slate-300">
          Authorized Representative ID Proof
        </label>
        <input
          type="file"
          id="repIdProof"
          {...register("repIdProof")}
          className="mt-1 block w-full text-sm text-slate-500 
            file:mr-4 file:py-2 file:px-4 file:border-0 
            file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
        />
        {errors.repIdProof && <p className="mt-1 text-sm text-red-400">{errors.repIdProof.message}</p>}
      </div>

      {/* Official Letter */}
      <div>
        <label htmlFor="officialLetter" className="block text-sm font-medium text-slate-300">
          Official Letter (on Panchayat Letterhead)
        </label>
        <input
          type="file"
          id="officialLetter"
          {...register("officialLetter")}
          className="mt-1 block w-full text-sm text-slate-500 
            file:mr-4 file:py-2 file:px-4 file:border-0 
            file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
        />
        {errors.officialLetter && <p className="mt-1 text-sm text-red-400">{errors.officialLetter.message}</p>}
      </div>

      {/* Panchayat Seal/Stamp */}
      <div>
        <label htmlFor="panchayatSeal" className="block text-sm font-medium text-slate-300">
          Panchayat Seal/Stamp
        </label>
        <input
          type="file"
          id="panchayatSeal"
          {...register("panchayatSeal")}
          className="mt-1 block w-full text-sm text-slate-500 
            file:mr-4 file:py-2 file:px-4 file:border-0 
            file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
        />
        {errors.panchayatSeal && <p className="mt-1 text-sm text-red-400">{errors.panchayatSeal.message}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h3 className="text-xl text-white font-semibold">
        Step 3: Organization Details
      </h3>
      <p className="text-slate-400">
        Provide the following details for verification as a community
        organization.
      </p>

      {/* Toggle Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => handleOrgTypeChange("ngo")}
          className={`flex-1 flex flex-col items-center p-4 border transition-all active:scale-[0.98] ${
            orgType === "ngo"
              ? "bg-green-600/30 border-green-500 text-white"
              : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700"
          }`}
        >
          <Building className="h-8 w-8 mb-2" />
          <span className="font-medium">NGO</span>
        </button>
        <button
          type="button"
          onClick={() => handleOrgTypeChange("panchayat")}
          className={`flex-1 flex flex-col items-center p-4 border transition-all active:scale-[0.98] ${
            orgType === "panchayat"
              ? "bg-green-600/30 border-green-500 text-white"
              : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700"
          }`}
        >
          <FileText className="h-8 w-8 mb-2" />
          <span className="font-medium">Panchayat</span>
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
          {orgType === "ngo" ? renderNgoForm() : renderPanchayatForm()}

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
              Next Step <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </motion.form>
      </AnimatePresence>
    </div>
  );
};

export default OrganizationDetailsStep;